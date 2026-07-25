<?php

namespace App\Http\Controllers\Stock\Gudang;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\RekapStokBarang;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StokGudangController extends Controller
{
    public function index(Request $request)
    {

        $stokQuery = $this->buildStokQuery($request);

        $stokBarang = $stokQuery->paginate(10)->through(function ($item) {
            $data = [
                'model_id' => $item->modelBarang->id,
                'kategori' => $item->modelBarang->kategori->nama ?? '-',
                'label' => $item->modelBarang->label ?? '-',
                'merek' => $item->modelBarang->merek->nama ?? '-',
                'model' => $item->modelBarang->nama ?? '-',
                'jumlah_rusak' => $item->jumlah_rusak,
                'jumlah_perbaikan' => $item->jumlah_perbaikan,
                'jumlah_tersedia' => $item->jumlah_tersedia,
                'jumlah_total' => $item->jumlah_rusak + $item->jumlah_perbaikan + $item->jumlah_tersedia,
            ];
        });

        $data = [
            'stokBarang' => $stokBarang,
            'filters' => $request->only(['search', 'kategori', 'merek', 'lokasi']),
            'kategoriList' => KategoriBarang::select('id', 'nama')->get(),
            'merekList' => MerekBarang::select('id', 'nama')->get(),
            'lokasiList' => Lokasi::where('is_gudang', true)->select('id', 'nama')->get(),
        ];

        return Inertia::render('stock/gudang/index', $data);
    }

    public function getDetailAsJson(ModelBarang $modelBarang)
    {
        // Ambil ID semua lokasi yang merupakan gudang
        $gudangLokasiIds = Lokasi::where('is_gudang', true)->pluck('id');

        // Ambil semua barang yang cocok dengan model dan lokasi gudang
        $barangList = Barang::query()
            ->where('model_id', $modelBarang->id)
            ->whereIn('lokasi_id', $gudangLokasiIds)
            ->with(['rak:id,kode_rak'])
            ->select('id', 'serial_number', 'status', 'rak_id', 'created_at')
            ->latest('created_at')
            ->get();

        return response()->json($barangList);
    }

    public function exportPdf(Request $request)
    {
        // 1. Panggil query builder yang sama dari method private
        $stokQuery = $this->buildStokQuery($request);

        // 2. Ambil semua data (tanpa paginasi) dan transformasikan
        $dataToExport = $stokQuery->get()->map(function ($item) {
            return [
                'kategori' => $item->modelBarang->kategori->nama ?? '-',
                'merek' => $item->modelBarang->merek->nama ?? '-',
                'model' => $item->modelBarang->nama ?? '-',
                'jumlah_rusak' => $item->jumlah_rusak,
                'jumlah_perbaikan' => $item->jumlah_perbaikan,
                'jumlah_tersedia' => $item->jumlah_tersedia,
                'jumlah_total' => $item->jumlah_rusak + $item->jumlah_perbaikan + $item->jumlah_tersedia,
            ];
        });

        $tanggalCetak = now()->isoFormat('D MMMM YYYY');
        $namaFile = 'laporan-stok-gudang-' . now()->format('Y-m-d') . '.pdf';

        // 3. Load view PDF dan generate file
        $pdf = Pdf::loadView('reports.laporan_stok_pdf', [
            'stokBarang' => $dataToExport,
            'tanggalCetak' => $tanggalCetak
        ]);

        // 4. Kembalikan sebagai unduhan
        return $pdf->download($namaFile);
    }

    private function buildStokQuery(Request $request)
    {
        $search = $request->input('search');
        $filterKategori = $request->input('kategori');
        $filterMerek = $request->input('merek');
        $filterLokasi = $request->input('lokasi');

        $stokQuery = RekapStokBarang::with([
                'modelBarang.merek',
                'modelBarang.kategori',
                'lokasi'
            ])
            ->whereHas('lokasi', fn ($q) => $q->where('is_gudang', true));

        if ($search) {
            $stokQuery->whereHas('modelBarang', function ($query) use ($search) {
                $query->where('nama', 'like', "%$search%");
            });
        }

        if ($filterKategori) {
            $stokQuery->whereHas('modelBarang.kategori', function ($query) use ($filterKategori) {
                $query->where('id', $filterKategori);
            });
        }

        if ($filterMerek) {
            $stokQuery->whereHas('modelBarang.merek', function ($query) use ($filterMerek) {
                $query->where('id', $filterMerek);
            });
        }

        if ($filterLokasi) {
            $stokQuery->where('lokasi_id', $filterLokasi);
        }

        // Mengurutkan berdasarkan nama model barang untuk konsistensi
        $stokQuery->orderBy(
            ModelBarang::select('nama')
                ->whereColumn('model_barang.id', 'rekap_stok_barang.model_id')
        );

        return $stokQuery;
    }
}
