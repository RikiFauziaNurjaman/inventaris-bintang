<?php

namespace App\Http\Controllers\Laporan;

use App\Exports\BarangMasukExport;
use App\Http\Controllers\Controller;
use App\Models\View\ViewBarangMasuk;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class LaporanBarangMasukController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'LaporanBarangMasukController_' . md5(json_encode(request()->all()));
        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($request) {

        $query = ViewBarangMasuk::query();
        $filters = $request->only('start_date', 'end_date', 'lokasi_id', 'search');

        if ($request->filled('lokasi_id')) {
            $query->whereIn('view_barang_masuk.serial_number', function($q) use ($request) {
                $q->select('serial_number')->from('barang')->where('lokasi_id', $request->lokasi_id);
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('view_barang_masuk.tanggal', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('view_barang_masuk.tanggal', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('view_barang_masuk.tanggal', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                 $q->whereRaw('LOWER(view_barang_masuk.serial_number) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(model) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(merek) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(asal_barang) LIKE ?', ["%{$search}%"]);
            });
        }

        $barangMasukData = $query->orderBy('tanggal', 'desc')->paginate(15)->withQueryString();

        
            return [
            'barangMasukData' => $barangMasukData,
            'filters' => $filters,
            'lokasiList' => \App\Models\Lokasi::select('id', 'nama')->orderBy('nama')->get(),
        ];
        });

        return Inertia::render('laporan/barang-masuk/index', $data);
    }

    public function exportBarangMasukExcel(Request $request)
    {
        return Excel::download(
            new BarangMasukExport($request->all()),
            'laporan_barang_masuk_' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportBarangMasukPdf(Request $request)
    {
        $filters = $request->all();
        $query = ViewBarangMasuk::query()
            ->select(
                'view_barang_masuk.*',
                'm.nama as merek_nama_real',
                'mb.nama as model_nama_real',
                'jb.nama as jenis_nama',
                'sl.nama as sub_lokasi_nama',
                'l.nama as lokasi_nama'
            )
            ->join('barang as b', 'view_barang_masuk.serial_number', '=', 'b.serial_number')
            ->leftJoin('model_barang as mb', 'b.model_id', '=', 'mb.id')
            ->leftJoin('merek_barang as m', 'mb.merek_id', '=', 'm.id')
            ->leftJoin('jenis_barang as jb', 'b.jenis_barang_id', '=', 'jb.id')
            ->leftJoin('sub_lokasi as sl', 'b.sub_lokasi_id', '=', 'sl.id')
            ->leftJoin('lokasi as l', 'b.lokasi_id', '=', 'l.id');

        if ($request->filled('lokasi_id')) {
            $query->whereIn('view_barang_masuk.serial_number', function($q) use ($request) {
                $q->select('serial_number')->from('barang')->where('lokasi_id', $request->lokasi_id);
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('view_barang_masuk.tanggal', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('view_barang_masuk.tanggal', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('view_barang_masuk.tanggal', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                 $q->whereRaw('LOWER(view_barang_masuk.serial_number) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(model) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(merek) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(asal_barang) LIKE ?', ["%{$search}%"]);
            });
        }

        $barangMasukData = $query->orderBy('tanggal', 'desc')->get();
        
        $lokasi = null;
        if ($request->filled('lokasi_id')) {
            $lokasi = \App\Models\Lokasi::find($request->lokasi_id);
        }

        $pdf = Pdf::loadView('reports.barang_masuk_pdf', [
            'barangMasukData' => $barangMasukData,
            'filters' => $filters,
            'lokasi' => $lokasi,
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ]);

        return $pdf->stream('laporan_barang_masuk_' . now()->format('Y-m-d') . '.pdf');
    }
}
