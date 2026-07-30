<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\BarangKeluarDetail;
use App\Models\BarangKembali;
use App\Models\BarangKembaliDetail;
use App\Models\BarangMasuk;
use App\Models\BarangMasukDetail;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\RekapStokBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function fastSearchSuggestions(Request $request)
    {
        $keyword = strtolower($request->input('q'));

        if (! $keyword) {
            return response()->json(['data' => []]);
        }

        $results = Barang::with(['rak.lokasi', 'modelBarang.merek'])
            ->where(function ($query) use ($keyword) {
                $query->whereRaw('LOWER(serial_number) LIKE ?', ["%{$keyword}%"])
                    ->orWhereHas('modelBarang', function ($q) use ($keyword) {
                        $q->whereRaw('LOWER(nama) LIKE ?', ["%{$keyword}%"])
                            ->orWhereHas('merek', fn ($m) => $m->whereRaw('LOWER(nama) LIKE ?', ["%{$keyword}%"]));
                    });
            })
            ->whereHas('rak.lokasi', fn ($q) => $q->where('is_gudang', true))
            ->limit(10)
            ->get()
            ->map(function ($barang) {
                return [
                    'id' => $barang->id,
                    'serial_number' => $barang->serial_number,
                    'nama_barang' => optional($barang->modelBarang)->nama ?? '-',
                    'merek' => optional($barang->modelBarang?->merek)->nama ?? '-',
                    'rak' => optional($barang->rak)->nama_rak ?? '-',
                    'kode_rak' => optional($barang->rak)->kode_rak ?? '-',
                    'baris' => optional($barang->rak)->baris ?? '-',
                ];
            });

        return response()->json(['data' => $results]);
    }

    public function getBarangDetail($id)
    {
        $barang = Barang::with(['rak.lokasi', 'asal', 'modelBarang.merek'])->findOrFail($id);

        $stok = RekapStokBarang::where('model_id', $barang->model_id)
            ->where('lokasi_id', $barang->lokasi_id)
            ->first();

        if (! $stok) {
            return response()->json(['error' => 'Stok tidak ditemukan'], 404);
        }

        return response()->json([
            'id' => $barang->id,
            'nama_barang' => optional($barang->modelBarang)->nama ?? '-',
            'serial_number' => $barang->serial_number,
            'merek' => optional($barang->modelBarang?->merek)->nama ?? '-',
            'model' => optional($barang->modelBarang)->nama ?? '-',
            'asal' => optional($barang->asal)->nama ?? '-',
            'kondisi' => $barang->kondisi_awal ?? '-',
            'status' => $barang->status ?? '-',
            'lokasi' => $barang->rak->lokasi->nama ?? '-',
            'rak' => [
                'nama_rak' => optional($barang->rak)->nama_rak ?? '-',
                'kode_rak' => optional($barang->rak)->kode_rak ?? '-',
                'baris' => optional($barang->rak)->baris ?? '-',
            ],
            'jumlah_tersedia' => $stok->jumlah_tersedia ?? 0,
        ]);
    }

    public function index()
    {
        $stok = RekapStokBarang::query()
            ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
            ->selectRaw('
                COALESCE(SUM(jumlah_total), 0) as total,
                COALESCE(SUM(CASE WHEN lokasi.is_gudang = true THEN jumlah_tersedia ELSE 0 END), 0) as gudang,
                COALESCE(SUM(CASE WHEN lokasi.is_gudang = false THEN jumlah_tersedia ELSE 0 END), 0) as distribusi,
                COALESCE(SUM(jumlah_rusak), 0) as rusak,
                COALESCE(SUM(jumlah_perbaikan), 0) as perbaikan,
                COALESCE(SUM(jumlah_terjual), 0) as terjual
            ')
            ->first();

        $stokSummary = [
            'total' => (int) $stok->total,
            'gudang' => (int) $stok->gudang,
            'distribusi' => (int) $stok->distribusi,
            'tersedia' => (int) $stok->gudang + (int) $stok->distribusi,
            'rusak' => (int) $stok->rusak,
            'perbaikan' => (int) $stok->perbaikan,
            'terjual' => (int) $stok->terjual,
        ];

        $stokPerLokasi = RekapStokBarang::select('lokasi_id')
            ->selectRaw('
                SUM(jumlah_tersedia) as tersedia,
                SUM(jumlah_rusak) as rusak,
                SUM(jumlah_perbaikan) as perbaikan,
                SUM(jumlah_total) as total
            ')
            ->whereHas('lokasi', fn ($query) => $query->where('is_gudang', false))
            ->groupBy('lokasi_id')
            ->with('lokasi')
            ->get()
            ->map(fn ($item) => [
                'lokasi' => $item->lokasi->nama ?? 'Tidak diketahui',
                'tersedia' => (int) $item->tersedia,
                'rusak' => (int) $item->rusak,
                'perbaikan' => (int) $item->perbaikan,
                'total' => (int) $item->total,
            ]);

        $latestMasuk = BarangMasuk::with('asal')->withCount('details')->latest()->take(5)->get()
            ->map(fn ($item) => [
                'tanggal' => $item->tanggal,
                'keterangan' => 'Barang masuk dari '.($item->asal->nama ?? '-'),
                'jumlah' => $item->details_count,
            ]);

        $latestKeluar = BarangKeluar::with('lokasi')->withCount('details')->latest()->take(5)->get()
            ->map(fn ($item) => [
                'tanggal' => $item->tanggal,
                'keterangan' => 'Barang keluar ke '.($item->lokasi->nama ?? '-'),
                'jumlah' => $item->details_count,
            ]);

        $latestKembali = BarangKembali::with('lokasi')->withCount('details')->latest()->take(5)->get()
            ->map(fn ($item) => [
                'tanggal' => $item->tanggal,
                'keterangan' => 'Barang kembali dari '.($item->lokasi->nama ?? '-'),
                'jumlah' => $item->details_count,
            ]);

        $stokKritis = RekapStokBarang::where('jumlah_tersedia', '<', 10)
            ->whereHas('lokasi', fn ($query) => $query->where('is_gudang', true))
            ->with(['lokasi', 'modelBarang.merek'])
            ->orderBy('jumlah_tersedia')
            ->take(8)
            ->get()
            ->map(fn ($item) => [
                'nama' => trim(($item->modelBarang?->merek?->nama ?? '').' '.($item->modelBarang?->nama ?? '-')),
                'lokasi' => $item->lokasi->nama ?? 'Tidak diketahui',
                'tersedia' => (int) $item->jumlah_tersedia,
            ]);

        $stokBaruSecondGudang = Barang::select('kondisi_awal')
            ->selectRaw('COUNT(*) as total')
            ->whereHas('lokasi', fn ($query) => $query->where('is_gudang', true))
            ->whereIn('kondisi_awal', ['baru', 'second'])
            ->groupBy('kondisi_awal')
            ->pluck('total', 'kondisi_awal');

        $monthStart = now()->startOfMonth()->toDateString();
        $transactionSummary = [
            'masuk' => BarangMasukDetail::whereHas('barangMasuk', fn ($query) => $query->where('tanggal', '>=', $monthStart))->count(),
            'keluar' => BarangKeluarDetail::whereHas('barangKeluar', fn ($query) => $query->where('tanggal', '>=', $monthStart))->count(),
            'kembali' => BarangKembaliDetail::whereHas('barangKembali', fn ($query) => $query->where('tanggal', '>=', $monthStart))->count(),
            'periode' => now()->translatedFormat('F Y'),
        ];

        return Inertia::render('dashboard', [
            'stokSummary' => $stokSummary,
            'stokPerLokasi' => $stokPerLokasi,
            'latestMasuk' => $latestMasuk,
            'latestKeluar' => $latestKeluar,
            'latestKembali' => $latestKembali,
            'stokKritis' => $stokKritis,
            'stokBaruSecondGudang' => [
                'baru' => (int) ($stokBaruSecondGudang['baru'] ?? 0),
                'second' => (int) ($stokBaruSecondGudang['second'] ?? 0),
            ],
            'transactionSummary' => $transactionSummary,
            'totalKategori' => KategoriBarang::count(),
            'totalJenisBarang' => JenisBarang::count(),
        ]);
    }
}
