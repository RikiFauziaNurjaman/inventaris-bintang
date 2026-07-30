<?php

namespace App\Http\Controllers\Stock\Gudang;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Lokasi;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockOpnameController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_STOCK_OPNAME->value)->only(['show', 'export', 'pdf']);
        $this->middleware('can:'.PermissionEnum::CREATE_STOCK_OPNAME->value)->only(['create', 'store']);
        $this->middleware('can:'.PermissionEnum::APPROVE_STOCK_OPNAME->value)->only(['approve']);
    }

    public function index(Request $request)
    {
        $canView = auth()->user()->can(PermissionEnum::VIEW_STOCK_OPNAME->value);
        abort_unless($canView || auth()->user()->can(PermissionEnum::PARTICIPATE_STOCK_OPNAME->value), 403);

        $data = StockOpname::with('lokasi:id,nama', 'user:id,name')
            ->when(! $canView, fn ($query) => $query->where('status', 'active'))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = mb_strtolower(trim($request->string('search')->toString()));
                $query->where(function ($query) use ($search) {
                    $query->whereRaw('LOWER(catatan) LIKE ?', ["%{$search}%"])
                        ->orWhereHas('lokasi', fn ($lokasi) => $lokasi->whereRaw('LOWER(nama) LIKE ?', ["%{$search}%"]))
                        ->orWhereHas('user', fn ($user) => $user->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]));
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('stock/stock-opname/index', [
            'data' => $data,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return inertia('stock/stock-opname/create', [
            'lokasi' => Lokasi::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'lokasi_id' => ['required', 'integer', 'exists:lokasi,id'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        $stockOpname = DB::transaction(function () use ($validated) {
            Lokasi::whereKey($validated['lokasi_id'])->lockForUpdate()->firstOrFail();

            if (StockOpname::where('lokasi_id', $validated['lokasi_id'])->where('status', 'active')->exists()) {
                throw ValidationException::withMessages([
                    'lokasi_id' => 'Masih ada sesi stock opname aktif pada lokasi ini.',
                ]);
            }

            $stockOpname = StockOpname::create([
                ...$validated,
                'user_id' => auth()->id(),
                'status' => 'active',
                'started_at' => now(),
            ]);

            Barang::where('lokasi_id', $validated['lokasi_id'])
                ->whereNotIn('status', ['dijual', 'dimusnahkan'])
                ->select(['id', 'model_id', 'serial_number', 'status'])
                ->chunkById(500, function ($barang) use ($stockOpname) {
                    $now = now();
                    StockOpnameItem::insert($barang->map(fn ($item) => [
                        'stock_opname_id' => $stockOpname->id,
                        'barang_id' => $item->id,
                        'model_id' => $item->model_id,
                        'serial_number' => trim($item->serial_number),
                        'normalized_serial' => self::normalizeSerial($item->serial_number),
                        'state' => 'pending',
                        'status_snapshot' => $item->status,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])->all());
                });

            return $stockOpname;
        });

        return redirect()->route('stock-opname.scan', $stockOpname)
            ->with('success', 'Sesi stock opname dimulai.');
    }

    public function scan(StockOpname $stockOpname)
    {
        $this->authorizeSessionParticipant($stockOpname);
        $stockOpname->load('lokasi:id,nama', 'user:id,name');

        return inertia('stock/stock-opname/scan', [
            'data' => $stockOpname,
            'progress' => $this->progressData($stockOpname),
        ]);
    }

    public function storeScan(Request $request, StockOpname $stockOpname)
    {
        $this->authorizeSessionParticipant($stockOpname);
        $validated = $request->validate([
            'serial_number' => ['required', 'string', 'max:255'],
        ]);
        $rawSerial = trim($validated['serial_number']);
        $normalized = self::normalizeSerial($rawSerial);

        if ($normalized === '') {
            return response()->json(['message' => 'Serial number wajib diisi.'], 422);
        }

        [$result, $item] = DB::transaction(function () use ($stockOpname, $normalized, $rawSerial) {
            // ponytail: one session lock serializes scans; use per-serial locks only if measured throughput requires it.
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'active', 409, 'Sesi stock opname sudah tidak aktif.');

            $item = StockOpnameItem::where('stock_opname_id', $session->id)
                ->where('normalized_serial', $normalized)
                ->lockForUpdate()
                ->first();

            if ($item) {
                if ($item->state !== 'pending') {
                    return ['duplicate', $item];
                }

                $item->update([
                    'state' => 'found',
                    'scanned_by' => auth()->id(),
                    'scanned_at' => now(),
                ]);

                return ['found', $item];
            }

            $barang = Barang::whereRaw('UPPER(TRIM(serial_number)) = ?', [$normalized])->first();
            $state = ! $barang
                ? 'unknown'
                : ($barang->lokasi_id !== $session->lokasi_id ? 'wrong_location' : 'unexpected');

            $item = StockOpnameItem::create([
                'stock_opname_id' => $session->id,
                'barang_id' => $barang?->id,
                'model_id' => $barang?->model_id,
                'serial_number' => $barang?->serial_number ?? $rawSerial,
                'normalized_serial' => $normalized,
                'state' => $state,
                'status_snapshot' => $barang?->status,
                'scanned_by' => auth()->id(),
                'scanned_at' => now(),
            ]);

            return [$state, $item];
        });

        $item->load('modelBarang.merek:id,nama', 'barang.lokasi:id,nama', 'scannedBy:id,name');

        return response()->json([
            'result' => $result,
            'item' => $this->itemData($item),
            'progress' => $this->progressData($stockOpname),
        ]);
    }

    public function destroyScan(StockOpname $stockOpname, StockOpnameItem $item)
    {
        $this->authorizeSessionParticipant($stockOpname);
        abort_unless($item->stock_opname_id === $stockOpname->id, 404);

        DB::transaction(function () use ($stockOpname, $item) {
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'active', 409, 'Sesi stock opname sudah tidak aktif.');

            $item->refresh();
            $canManage = auth()->id() === $session->user_id
                || auth()->user()->can(PermissionEnum::EDIT_STOCK_OPNAME->value);
            abort_unless($canManage || auth()->id() === $item->scanned_by, 403);

            if ($item->state === 'found') {
                $item->update(['state' => 'pending', 'scanned_by' => null, 'scanned_at' => null]);
            } elseif ($item->state !== 'pending') {
                $item->delete();
            }
        });

        return response()->json(['progress' => $this->progressData($stockOpname)]);
    }

    public function progress(StockOpname $stockOpname)
    {
        abort_unless(
            auth()->user()->can(PermissionEnum::VIEW_STOCK_OPNAME->value)
            || auth()->user()->can(PermissionEnum::PARTICIPATE_STOCK_OPNAME->value)
            || auth()->id() === $stockOpname->user_id
            || auth()->user()->can(PermissionEnum::EDIT_STOCK_OPNAME->value),
            403
        );

        return response()->json($this->progressData($stockOpname));
    }

    public function submit(StockOpname $stockOpname)
    {
        $this->authorizeSessionManager($stockOpname);
        DB::transaction(function () use ($stockOpname) {
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'active', 409, 'Hanya sesi aktif yang dapat dikirim.');
            $session->update(['status' => 'submitted', 'submitted_at' => now()]);
        });

        return redirect()->route('stock-opname.show', $stockOpname)->with('success', 'Stock opname dikirim untuk direview.');
    }

    public function reopen(StockOpname $stockOpname)
    {
        $this->authorizeSessionManager($stockOpname);
        DB::transaction(function () use ($stockOpname) {
            Lokasi::whereKey($stockOpname->lokasi_id)->lockForUpdate()->firstOrFail();
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'submitted', 409, 'Hanya sesi menunggu review yang dapat dibuka kembali.');
            abort_if(
                StockOpname::where('lokasi_id', $session->lokasi_id)
                    ->where('status', 'active')
                    ->where('id', '!=', $session->id)
                    ->exists(),
                409,
                'Lokasi ini sudah memiliki sesi stock opname aktif.'
            );
            $session->update(['status' => 'active', 'submitted_at' => null]);
        });

        return redirect()->route('stock-opname.scan', $stockOpname)->with('success', 'Sesi stock opname dibuka kembali.');
    }

    public function approve(StockOpname $stockOpname)
    {
        DB::transaction(function () use ($stockOpname) {
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'submitted', 409, 'Stock opname harus dikirim sebelum disetujui.');
            $session->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        });

        return back()->with('success', 'Audit stock opname berhasil disetujui tanpa mengubah data stok.');
    }

    public function destroy(StockOpname $stockOpname)
    {
        $canCancel = auth()->id() === $stockOpname->user_id
            || auth()->user()->can(PermissionEnum::DELETE_STOCK_OPNAME->value);
        abort_unless($canCancel, 403);
        DB::transaction(function () use ($stockOpname) {
            $session = StockOpname::whereKey($stockOpname->id)->lockForUpdate()->firstOrFail();
            abort_unless($session->status === 'active', 409, 'Hanya sesi aktif yang dapat dibatalkan.');
            $session->update(['status' => 'cancelled']);
        });

        return redirect()->route('stock-opname.index')->with('success', 'Sesi stock opname dibatalkan.');
    }

    public function show(Request $request, StockOpname $stockOpname)
    {
        $stockOpname->load([
            'user:id,name',
            'lokasi:id,nama',
            'approvedBy:id,name',
            'details.modelBarang.kategori:id,nama',
            'details.modelBarang.merek:id,nama',
        ]);

        $items = null;
        if ($stockOpname->workflow_version >= 2) {
            $state = $request->string('state')->toString();
            $search = trim($request->string('search')->toString());
            $items = $stockOpname->items()
                ->with(['modelBarang.merek:id,nama', 'modelBarang.kategori:id,nama', 'barang.lokasi:id,nama', 'scannedBy:id,name'])
                ->when($state, fn ($query) => $query->where('state', $state))
                ->when($search, fn ($query) => $query->where('normalized_serial', 'like', '%'.self::normalizeSerial($search).'%'))
                ->orderByRaw("CASE WHEN state = 'pending' THEN 0 ELSE 1 END")
                ->orderByDesc('scanned_at')
                ->paginate(25)
                ->withQueryString()
                ->through(fn ($item) => $this->itemData($item));
        }

        return inertia('stock/stock-opname/show', [
            'data' => $stockOpname,
            'items' => $items,
            'progress' => $items ? $this->progressData($stockOpname, false) : null,
            'filters' => $request->only(['state', 'search']),
        ]);
    }

    public function export(StockOpname $stockOpname)
    {
        $stockOpname->load('lokasi:id,nama');

        return response()->streamDownload(function () use ($stockOpname) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Serial Number', 'Status Temuan', 'Model', 'Status Saat Mulai', 'Petugas', 'Waktu Scan'], ';', '"', '');

            $stockOpname->items()
                ->with('modelBarang:id,nama', 'scannedBy:id,name')
                ->orderBy('state')
                ->chunk(500, function ($items) use ($output) {
                    foreach ($items as $item) {
                        fputcsv(
                            $output,
                            [
                                $item->serial_number,
                                $item->state,
                                $item->modelBarang?->nama,
                                $item->status_snapshot,
                                $item->scannedBy?->name,
                                $item->scanned_at?->format('Y-m-d H:i:s'),
                            ],
                            ';',
                            '"',
                            ''
                        );
                    }
                });
            fclose($output);
        }, 'stock-opname-'.$stockOpname->id.'.csv', ['Content-Type' => 'text/csv']);
    }

    public function pdf(StockOpname $stockOpname)
    {
        abort_unless($stockOpname->status === 'approved', 409, 'PDF hanya tersedia setelah stock opname disetujui.');

        $stockOpname->load([
            'lokasi:id,nama,alamat',
            'user:id,name',
            'approvedBy:id,name',
            'details.modelBarang.kategori:id,nama',
            'details.modelBarang.merek:id,nama',
        ]);

        $items = collect();
        $progress = null;
        if ($stockOpname->workflow_version >= 2) {
            $items = $stockOpname->items()
                ->with(['modelBarang.merek:id,nama', 'modelBarang.kategori:id,nama', 'barang.lokasi:id,nama', 'scannedBy:id,name'])
                ->orderByRaw("CASE state WHEN 'wrong_location' THEN 1 WHEN 'unexpected' THEN 2 WHEN 'unknown' THEN 3 WHEN 'pending' THEN 4 ELSE 5 END")
                ->orderBy('serial_number')
                ->get();
            $progress = $this->progressData($stockOpname, false);
        }

        return Pdf::loadView('reports.stock_opname_pdf', [
            'opname' => $stockOpname,
            'items' => $items,
            'progress' => $progress,
            'printedBy' => auth()->user(),
        ])->setPaper('a4', 'landscape')
            ->stream('laporan-stock-opname-'.$stockOpname->id.'.pdf');
    }

    private function authorizeSessionManager(StockOpname $stockOpname): void
    {
        abort_unless(
            auth()->id() === $stockOpname->user_id
            || auth()->user()->can(PermissionEnum::EDIT_STOCK_OPNAME->value),
            403
        );
    }

    private function authorizeSessionParticipant(StockOpname $stockOpname): void
    {
        abort_unless(
            auth()->id() === $stockOpname->user_id
            || auth()->user()->can(PermissionEnum::PARTICIPATE_STOCK_OPNAME->value)
            || auth()->user()->can(PermissionEnum::EDIT_STOCK_OPNAME->value),
            403
        );
    }

    private function progressData(StockOpname $stockOpname, bool $withRecent = true): array
    {
        $counts = $stockOpname->items()
            ->selectRaw('state, COUNT(*) as total')
            ->groupBy('state')
            ->pluck('total', 'state');
        $pending = (int) ($counts['pending'] ?? 0);
        $found = (int) ($counts['found'] ?? 0);
        $expected = $pending + $found;

        $contributors = $stockOpname->items()
            ->whereNotNull('scanned_by')
            ->select('scanned_by')
            ->distinct()
            ->with('scannedBy:id,name')
            ->get()
            ->pluck('scannedBy')
            ->filter()
            ->values();

        $recent = $withRecent
            ? $stockOpname->items()
                ->whereNotNull('scanned_at')
                ->with(['modelBarang.merek:id,nama', 'modelBarang.kategori:id,nama', 'barang.lokasi:id,nama', 'scannedBy:id,name'])
                ->latest('scanned_at')
                ->limit(12)
                ->get()
                ->map(fn ($item) => $this->itemData($item))
                ->values()
            : [];

        return [
            'status' => $stockOpname->fresh()->status,
            'expected' => $expected,
            'found' => $found,
            'pending' => $pending,
            'wrong_location' => (int) ($counts['wrong_location'] ?? 0),
            'unexpected' => (int) ($counts['unexpected'] ?? 0),
            'unknown' => (int) ($counts['unknown'] ?? 0),
            'percent' => $expected ? (int) round(($found / $expected) * 100) : 100,
            'contributors' => $contributors,
            'recent' => $recent,
        ];
    }

    private function itemData(StockOpnameItem $item): array
    {
        return [
            'id' => $item->id,
            'serial_number' => $item->serial_number,
            'state' => $item->state,
            'status_snapshot' => $item->status_snapshot,
            'scanned_at' => $item->scanned_at?->toIso8601String(),
            'model' => $item->modelBarang ? [
                'nama' => $item->modelBarang->nama,
                'merek' => $item->modelBarang->merek?->nama,
                'kategori' => $item->modelBarang->kategori?->nama,
            ] : null,
            'lokasi_sistem' => $item->barang?->lokasi?->nama,
            'scanned_by' => $item->scannedBy ? [
                'id' => $item->scannedBy->id,
                'name' => $item->scannedBy->name,
            ] : null,
        ];
    }

    private static function normalizeSerial(string $serial): string
    {
        return mb_strtoupper(trim($serial));
    }
}
