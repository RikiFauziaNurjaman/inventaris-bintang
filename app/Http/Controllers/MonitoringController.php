<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Lokasi;
use App\Models\SubLokasi;
use App\Models\KategoriBarang;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $lokasiQuery = Lokasi::whereHas('barang', function ($q) use ($request) {
            if ($request->filled('lokasi_id')) {
                $q->where('lokasi_id', $request->lokasi_id);
            }
            if ($request->filled('sub_lokasi_id')) {
                $q->where('sub_lokasi_id', $request->sub_lokasi_id);
            }
            if ($request->filled('status')) {
                $q->where('status', $request->status);
            }
            if ($request->filled('kategori_id')) {
                $q->whereHas('modelBarang', function ($q2) use ($request) {
                    $q2->where('kategori_id', $request->kategori_id);
                });
            }
        });

        // Optional: Jika ingin filter lokasi diterapkan ke query Lokasi secara langsung
        if ($request->filled('lokasi_id')) {
            $lokasiQuery->where('id', $request->lokasi_id);
        }

        $lokasiPaginated = $lokasiQuery->orderBy('nama')->paginate(25)->withQueryString();

        $lokasiIds = $lokasiPaginated->pluck('id');

        $aggregatesQuery = Barang::whereIn('lokasi_id', $lokasiIds)
            ->with(['modelBarang.merek', 'modelBarang:id,nama,merek_id']);

        if ($request->filled('sub_lokasi_id')) {
            $aggregatesQuery->where('sub_lokasi_id', $request->sub_lokasi_id);
        }
        if ($request->filled('status')) {
            $aggregatesQuery->where('status', $request->status);
        }
        if ($request->filled('kategori_id')) {
            $aggregatesQuery->whereHas('modelBarang', function ($q) use ($request) {
                $q->where('kategori_id', $request->kategori_id);
            });
        }

        $aggregates = $aggregatesQuery->get()->groupBy('lokasi_id');

        $lokasiPaginated->setCollection(
            $lokasiPaginated->getCollection()->map(function ($lokasi) use ($aggregates) {
                $items = $aggregates->get($lokasi->id, collect());
                
                $models = $items->map(function ($item) {
                    $merek = $item->modelBarang->merek->nama ?? '';
                    $model = $item->modelBarang->nama ?? '';
                    return trim($merek . ' ' . $model);
                })->unique()->filter()->values()->toArray();

                return [
                    'id' => $lokasi->id,
                    'nama' => $lokasi->nama,
                    'models' => $models,
                    'jumlah' => $items->count(),
                ];
            })
        );

        // Get filter options
        $lokasiList = Lokasi::select('id', 'nama')->orderBy('nama')->get();
        $subLokasiList = SubLokasi::with('lokasi:id,nama')
            ->select('id', 'nama', 'lokasi_id')
            ->orderBy('nama')
            ->get();
        $kategoriList = KategoriBarang::select('id', 'nama')->orderBy('nama')->get();

        // Summary statistics
        $stats = [
            'total' => Barang::count(),
            'baik' => Barang::where('status', 'baik')->count(),
            'rusak' => Barang::where('status', 'rusak')->count(),
            'diperbaiki' => Barang::where('status', 'diperbaiki')->count(),
            'terdistribusi' => Barang::whereHas('lokasi', function($q) {
                $q->where('is_gudang', false);
            })->count(),
        ];

        return Inertia::render('monitoring/index', [
            'lokasiPaginated' => $lokasiPaginated,
            'lokasiList' => $lokasiList,
            'subLokasiList' => $subLokasiList,
            'kategoriList' => $kategoriList,
            'filters' => $request->only(['lokasi_id', 'sub_lokasi_id', 'status', 'kategori_id']),
            'stats' => $stats,
        ]);
    }

    /**
     * Halaman detail per-lokasi — menampilkan semua barang di lokasi tertentu
     */
    public function showLokasi(Request $request, Lokasi $lokasi)
    {
        $query = Barang::with([
            'modelBarang:id,nama,merek_id,kategori_id,label,jenis_id',
            'modelBarang.merek:id,nama',
            'modelBarang.kategori:id,nama',
            'modelBarang.jenis:id,nama',
            'jenisBarang:id,nama',
            'subLokasi:id,nama,kode,lantai',
            'rak:id,kode_rak',
            'asal:id,nama',
        ])->where('lokasi_id', $lokasi->id);

        // Filter by sub_lokasi
        if ($request->filled('sub_lokasi_id')) {
            $query->where('sub_lokasi_id', $request->sub_lokasi_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('modelBarang', function ($q) use ($request) {
                $q->where('kategori_id', $request->kategori_id);
            });
        }

        // Search by serial number or PIC
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(serial_number) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(pic) LIKE ?', ["%{$search}%"]);
            });
        }

        $barang = $query->orderBy('sub_lokasi_id')
            ->orderBy('serial_number')
            ->paginate(25)
            ->withQueryString();

        // Stats khusus lokasi ini
        $statsQuery = Barang::where('lokasi_id', $lokasi->id);
        $stats = [
            'total' => (clone $statsQuery)->count(),
            'baik' => (clone $statsQuery)->where('status', 'baik')->count(),
            'rusak' => (clone $statsQuery)->where('status', 'rusak')->count(),
            'diperbaiki' => (clone $statsQuery)->where('status', 'diperbaiki')->count(),
        ];

        // Summary per model barang (ringkasan berapa unit tiap model)
        $modelSummary = Barang::where('lokasi_id', $lokasi->id)
            ->with(['modelBarang:id,nama,merek_id', 'modelBarang.merek:id,nama'])
            ->get()
            ->groupBy('model_id')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'model_id' => $first->model_id,
                    'model_nama' => $first->modelBarang->nama ?? '-',
                    'merek_nama' => $first->modelBarang->merek->nama ?? '-',
                    'total' => $items->count(),
                    'baik' => $items->where('status', 'baik')->count(),
                    'rusak' => $items->where('status', 'rusak')->count(),
                    'diperbaiki' => $items->where('status', 'diperbaiki')->count(),
                ];
            })
            ->sortByDesc('total')
            ->values();

        // Sub-lokasi di lokasi ini (untuk filter)
        $subLokasiList = SubLokasi::where('lokasi_id', $lokasi->id)
            ->select('id', 'nama', 'kode', 'lantai')
            ->orderBy('nama')
            ->get();

        // Kategori (untuk filter)
        $kategoriList = KategoriBarang::select('id', 'nama')->orderBy('nama')->get();

        return Inertia::render('monitoring/lokasi-detail', [
            'lokasi' => $lokasi,
            'barang' => $barang,
            'stats' => $stats,
            'modelSummary' => $modelSummary,
            'subLokasiList' => $subLokasiList,
            'kategoriList' => $kategoriList,
            'filters' => $request->only(['sub_lokasi_id', 'status', 'kategori_id', 'search']),
        ]);
    }

    public function exportPdf(Request $request, Lokasi $lokasi)
    {
        $query = Barang::with([
            'modelBarang:id,nama,merek_id,kategori_id,label,jenis_id',
            'modelBarang.merek:id,nama',
            'modelBarang.kategori:id,nama',
            'modelBarang.jenis:id,nama',
            'jenisBarang:id,nama',
            'subLokasi:id,nama,kode,lantai',
            'rak:id,kode_rak',
            'asal:id,nama',
            'mutasi' => function ($q) use ($lokasi) {
                $q->where('lokasi_tujuan_id', $lokasi->id)->latest('tanggal');
            }
        ])->where('lokasi_id', $lokasi->id);

        // Filter by sub_lokasi
        if ($request->filled('sub_lokasi_id')) {
            $query->where('sub_lokasi_id', $request->sub_lokasi_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('modelBarang', function ($q) use ($request) {
                $q->where('kategori_id', $request->kategori_id);
            });
        }

        // Search by serial number or PIC
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(serial_number) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(pic) LIKE ?', ["%{$search}%"]);
            });
        }

        $barangList = $query->get()->sortBy(function($barang) {
            return $barang->mutasi->first()?->tanggal ?? '9999-12-31';
        })->values();

        $data = [
            'lokasi' => $lokasi,
            'barangList' => $barangList,
            'tanggalCetak' => now()->translatedFormat('d F Y'),
            'filters' => $request->only(['sub_lokasi_id', 'status', 'kategori_id', 'search']),
        ];

        $pdf = Pdf::loadView('reports.monitoring_lokasi_pdf', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-monitoring-'.str_replace(' ', '-', strtolower($lokasi->nama)).'-'.date('Ymd').'.pdf');
    }

    /**
     * API untuk mendapatkan sub-lokasi berdasarkan lokasi (untuk cascade filter)
     */
    public function getSubLokasiByLokasi(Request $request)
    {
        $lokasiId = $request->input('lokasi_id');
        
        if (!$lokasiId) {
            return response()->json([]);
        }

        $subLokasi = SubLokasi::where('lokasi_id', $lokasiId)
            ->select('id', 'nama', 'kode', 'lantai')
            ->orderBy('nama')
            ->get();

        return response()->json($subLokasi);
    }
}
