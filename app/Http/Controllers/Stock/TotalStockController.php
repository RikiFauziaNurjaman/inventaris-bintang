<?php

namespace App\Http\Controllers\Stock;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TotalStockController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_STOK_TOTAL->value);
    }

    public function index(Request $request)
    {
        $query = $this->summaryQuery($request);

        return Inertia::render('stock/total/index', [
            'barangList' => (clone $query)->paginate(20)->withQueryString(),
            'summary' => $this->totals($this->filteredQuery($request)),
            'filters' => $request->only(['search', 'kategori', 'jenis', 'lokasi', 'status', 'kondisi']),
            'filterOptions' => [
                'kategoriList' => DB::table('kategori_barang')->orderBy('nama')->pluck('nama'),
                'jenisList' => DB::table('jenis_barang')->orderBy('nama')->pluck('nama'),
                'lokasiList' => DB::table('lokasi')->orderBy('nama')->pluck('nama'),
                'statusList' => DB::table('barang')->whereNotNull('status')->distinct()->orderBy('status')->pluck('status'),
                'kondisiList' => DB::table('barang')->whereNotNull('kondisi_awal')->distinct()->orderBy('kondisi_awal')->pluck('kondisi_awal'),
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        $query = $this->summaryQuery($request);

        return Pdf::loadView('reports.stock_total_pdf', [
            'barangList' => $query->get(),
            'summary' => $this->totals($this->filteredQuery($request)),
            'filters' => $request->only(['search', 'kategori', 'jenis', 'lokasi', 'status', 'kondisi']),
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ])->setPaper('a4', 'landscape')->stream('ringkasan-stok-'.date('Ymd').'.pdf');
    }

    private function baseQuery(): Builder
    {
        return DB::table('barang')
            ->leftJoin('model_barang', 'barang.model_id', '=', 'model_barang.id')
            ->leftJoin('merek_barang', 'model_barang.merek_id', '=', 'merek_barang.id')
            ->leftJoin('kategori_barang', 'model_barang.kategori_id', '=', 'kategori_barang.id')
            ->leftJoin('jenis_barang', 'barang.jenis_barang_id', '=', 'jenis_barang.id')
            ->leftJoin('lokasi', 'barang.lokasi_id', '=', 'lokasi.id');
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = $this->baseQuery();

        if ($search = strtolower(trim((string) $request->input('search')))) {
            $query->where(function ($query) use ($search) {
                $query->whereRaw('LOWER(model_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(merek_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(kategori_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(jenis_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(lokasi.nama) LIKE ?', ["%{$search}%"]);
            });
        }

        foreach ([
            'kategori' => 'kategori_barang.nama',
            'jenis' => 'jenis_barang.nama',
            'lokasi' => 'lokasi.nama',
            'status' => 'barang.status',
            'kondisi' => 'barang.kondisi_awal',
        ] as $filter => $column) {
            if ($request->filled($filter)) {
                $query->where($column, $request->input($filter));
            }
        }

        return $query;
    }

    private function summaryQuery(Request $request): Builder
    {
        return $this->filteredQuery($request)
            ->selectRaw("
                MIN(barang.id) as id,
                barang.model_id,
                barang.lokasi_id,
                lokasi.nama as lokasi,
                kategori_barang.nama as kategori,
                jenis_barang.nama as jenis,
                merek_barang.nama as merek,
                model_barang.nama as model,
                COUNT(*) as total,
                SUM(CASE WHEN barang.status IN ('baik', 'bagus') THEN 1 ELSE 0 END) as baik,
                SUM(CASE WHEN barang.status = 'dipinjamkan' THEN 1 ELSE 0 END) as dipinjamkan,
                SUM(CASE WHEN barang.status = 'rusak' THEN 1 ELSE 0 END) as rusak,
                SUM(CASE WHEN barang.status IN ('diperbaiki', 'maintenance') THEN 1 ELSE 0 END) as perbaikan,
                SUM(CASE WHEN barang.status = 'dijual' THEN 1 ELSE 0 END) as terjual,
                SUM(CASE WHEN barang.status = 'dimusnahkan' THEN 1 ELSE 0 END) as dimusnahkan
            ")
            ->groupBy([
                'barang.model_id',
                'barang.lokasi_id',
                'lokasi.nama',
                'kategori_barang.nama',
                'jenis_barang.nama',
                'merek_barang.nama',
                'model_barang.nama',
            ])
            ->orderBy('lokasi.nama')
            ->orderBy('kategori_barang.nama')
            ->orderBy('merek_barang.nama')
            ->orderBy('model_barang.nama');
    }

    private function totals(Builder $query): object
    {
        return $query->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN barang.status IN ('baik', 'bagus') THEN 1 ELSE 0 END) as baik,
            SUM(CASE WHEN barang.status = 'dipinjamkan' THEN 1 ELSE 0 END) as dipinjamkan,
            SUM(CASE WHEN barang.status = 'rusak' THEN 1 ELSE 0 END) as rusak,
            SUM(CASE WHEN barang.status IN ('diperbaiki', 'maintenance') THEN 1 ELSE 0 END) as perbaikan,
            SUM(CASE WHEN barang.status = 'dijual' THEN 1 ELSE 0 END) as terjual,
            SUM(CASE WHEN barang.status = 'dimusnahkan' THEN 1 ELSE 0 END) as dimusnahkan
        ")->first();
    }
}
