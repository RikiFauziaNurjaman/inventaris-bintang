<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\BarangActivityHelper;
use App\Helpers\MasterDataHelper;
use App\Http\Controllers\Controller;
use App\Models\Barang;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DataBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_BARANG_INVENTARIS->value)->only(['index', 'exportPdf']);
        $this->middleware('can:'.PermissionEnum::EDIT_BARANG_INVENTARIS->value)->only(['update']);
    }

    public function index(Request $request)
    {
        return Inertia::render('master/barang/index', [
            'barangList' => $this->filteredQuery($request)->latest('id')->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'filterOptions' => [
                'kategoriList' => DB::table('kategori_barang')->orderBy('nama')->pluck('nama'),
                'lokasiList' => DB::table('lokasi')->orderBy('nama')->pluck('nama'),
                'statusList' => DB::table('barang')->whereNotNull('status')->distinct()->orderBy('status')->pluck('status'),
                'kondisiList' => ['baru', 'second'],
                'rakList' => MasterDataHelper::getRakList(),
                'subLokasiList' => DB::table('sub_lokasi')->select('id', 'lokasi_id', 'nama')->orderBy('nama')->get(),
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        return Pdf::loadView('reports.data_barang_pdf', [
            'barangList' => $this->filteredQuery($request)->latest('id')->get(),
            'filters' => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'tanggalCetak' => now()->translatedFormat('d F Y, H:i'),
        ])->setPaper('a4', 'landscape')->stream('data-barang-'.date('Ymd-His').'.pdf');
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = Barang::query()->with([
            'modelBarang:id,nama,kategori_id,merek_id,jenis_id',
            'modelBarang.kategori:id,nama',
            'modelBarang.merek:id,nama',
            'modelBarang.jenis:id,nama',
            'asal:id,nama',
            'lokasi:id,nama,is_gudang',
            'subLokasi:id,nama,lokasi_id',
            'rak:id,nama_rak,kode_rak,lokasi_id',
        ]);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($query) use ($search) {
                $query->whereRaw('LOWER(serial_number) LIKE ?', ['%'.strtolower($search).'%'])
                    ->orWhereHas('modelBarang', fn ($model) => $model->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']))
                    ->orWhereHas('modelBarang.merek', fn ($merek) => $merek->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']))
                    ->orWhereHas('lokasi', fn ($lokasi) => $lokasi->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']));
            });
        }

        if ($request->filled('kategori')) {
            $query->whereHas('modelBarang.kategori', fn ($kategori) => $kategori->where('nama', $request->string('kategori')));
        }
        if ($request->filled('lokasi')) {
            $query->whereHas('lokasi', fn ($lokasi) => $lokasi->where('nama', $request->string('lokasi')));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('kondisi')) {
            $query->where('kondisi_awal', $request->string('kondisi'));
        }

        return $query;
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'serial_number' => ['required', 'string', 'max:255', Rule::unique('barang', 'serial_number')->ignore($barang->id)],
            'kondisi_awal' => ['required', Rule::in(['baru', 'second'])],
            'rak_id' => [
                'nullable',
                'integer',
                Rule::exists('rak_barang', 'id')->where(fn ($query) => $query->where('lokasi_id', $barang->lokasi_id)),
            ],
            'sub_lokasi_id' => [
                'nullable',
                'integer',
                Rule::exists('sub_lokasi', 'id')->where(fn ($query) => $query->where('lokasi_id', $barang->lokasi_id)),
            ],
            'pic' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'model_id' => ['prohibited'],
            'lokasi_id' => ['prohibited'],
            'asal_id' => ['prohibited'],
            'status' => ['prohibited'],
        ]);

        if ($validated['serial_number'] !== $barang->serial_number && BarangActivityHelper::blockReason($barang)) {
            throw ValidationException::withMessages([
                'serial_number' => 'Serial number hanya dapat dikoreksi sebelum barang memiliki aktivitas transaksi atau audit Stock Opname.',
            ]);
        }

        $barang->update($validated);

        $kondisi = $validated['kondisi_awal'] === 'baru' ? 'Baru' : 'Second';

        return redirect()->route('barang.index')->with('message', "Data barang berhasil diperbarui. Kondisi awal saat ini: {$kondisi}.");
    }
}
