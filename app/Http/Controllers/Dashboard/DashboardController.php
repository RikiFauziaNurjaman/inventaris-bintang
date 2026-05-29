<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\BarangKembali;
use App\Models\BarangMasuk;
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

        if (!$keyword) {
            return response()->json(['data' => []]);
        }

        $results = Barang::with(['rak.lokasi', 'modelBarang.merek'])
            ->where(function ($query) use ($keyword) {
                $query->whereRaw('LOWER(serial_number) LIKE ?', ["%{$keyword}%"])
                    ->orWhereHas('modelBarang', function ($q) use ($keyword) {
                        $q->whereRaw('LOWER(nama) LIKE ?', ["%{$keyword}%"])
                            ->orWhereHas('merek', fn($m) => $m->whereRaw('LOWER(nama) LIKE ?', ["%{$keyword}%"]));
                    });
            })
            ->whereHas('rak.lokasi', fn($q) => $q->where('is_gudang', true))
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
        return \Illuminate\Support\Facades\Cache::remember('detail_barang_'.$id, 3600, function() use ($id) {
            $barang = Barang::with(['rak.lokasi', 'asal', 'modelBarang.merek'])->findOrFail($id);

            $stok = RekapStokBarang::where('model_id', $barang->model_id)
                    ->where('lokasi_id', $barang->lokasi_id)
                    ->first();

            if (!$stok) {
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
        });
    }

    public function index()
    {
        $data = \Illuminate\Support\Facades\Cache::remember('dashboard_data', 3600, function () {
            // Ringkasan total stok
            $stokSummary = RekapStokBarang::selectRaw('
                    SUM(jumlah_tersedia) as tersedia,
                    SUM(jumlah_rusak) as rusak,
                    SUM(jumlah_perbaikan) as perbaikan,
                    SUM(jumlah_terjual) as terjual
                ')
                ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
                ->where('lokasi.is_gudang', true)
                ->first();
            // Hitung jumlah total di PHP
            $stokSummary->total = $stokSummary->tersedia + $stokSummary->rusak + $stokSummary->perbaikan;

            // Stok per lokasi
            $stokPerLokasi = RekapStokBarang::select('lokasi_id')
                ->selectRaw('
                    SUM(jumlah_tersedia) as tersedia,
                    SUM(jumlah_rusak) as rusak,
                    SUM(jumlah_perbaikan) as perbaikan,
                    SUM(jumlah_total) as total
                ')
                ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
                ->where('lokasi.is_gudang', false)
                ->groupBy('lokasi_id')
                ->with('lokasi') // tetap pakai eager load agar nama lokasi bisa dipakai
                ->get()
                ->map(function ($item) {
                    return [
                        'lokasi' => $item->lokasi->nama ?? 'Tidak diketahui',
                        'tersedia' => $item->tersedia,
                        'rusak' => $item->rusak,
                        'perbaikan' => $item->perbaikan,
                        'total' => $item->total,
                    ];
                });

            // Aktivitas terakhir
            $latestMasuk = BarangMasuk::with('asal')->latest()->take(5)->get()
                ->map(fn($item) => [
                    'tanggal' => $item->tanggal,
                    'keterangan' => 'Barang masuk dari ' . ($item->asal->nama ?? '-'),
                ]);

            $latestKeluar = BarangKeluar::with('lokasi')->latest()->take(5)->get()
                ->map(fn($item) => [
                    'tanggal' => $item->tanggal,
                    'keterangan' => 'Barang keluar ke ' . ($item->lokasi->nama ?? '-'),
                ]);

            $latestKembali = BarangKembali::with('lokasi')->latest()->take(5)->get()
                ->map(fn($item) => [
                    'tanggal' => $item->tanggal,
                    'keterangan' => 'Barang kembali dari ' . ($item->lokasi->nama ?? '-'),
                ]);

            // Stok kritis (tersedia < 10)
            $stokKritis = RekapStokBarang::where('jumlah_tersedia', '<', 10)
                ->whereHas('lokasi', fn($q) => $q->where('is_gudang', true))
                ->with(['lokasi', 'modelBarang.merek']) // gunakan eager load relasi yang benar
                ->get()
                ->map(function ($item) {
                    return [
                        'nama' => optional($item->modelBarang?->merek)->nama . ' ' . ($item->modelBarang->nama ?? '-') ?? 'Tidak diketahui',
                        'lokasi' => $item->lokasi->nama ?? 'Tidak diketahui',
                        'tersedia' => $item->jumlah_tersedia,
                    ];
                });

            $stokBaruSecondGudang = Barang::select('kondisi_awal')
                ->selectRaw('COUNT(*) as total')
                ->whereHas('lokasi', fn ($q) => $q->where('is_gudang', true))
                ->whereIn('kondisi_awal', ['baru', 'second'])
                ->groupBy('kondisi_awal')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->kondisi_awal => $item->total];
                });

            // Set default 0 jika tidak ada data
            $stokBaruSecondGudang = [
                'baru' => $stokBaruSecondGudang['baru'] ?? 0,
                'second' => $stokBaruSecondGudang['second'] ?? 0,
            ];

            $totalKategori = KategoriBarang::count();
            $totalJenisBarang = JenisBarang::count();

            return [
                'stokSummary' => $stokSummary,
                'stokPerLokasi' => $stokPerLokasi,
                'latestMasuk' => $latestMasuk,
                'latestKeluar' => $latestKeluar,
                'latestKembali' => $latestKembali,
                'stokKritis' => $stokKritis,
                'stokBaruSecondGudang' => $stokBaruSecondGudang,
                'totalKategori' => $totalKategori,
                'totalJenisBarang' => $totalJenisBarang,
            ];
        });

        return Inertia::render('dashboard', $data);
    }
}
