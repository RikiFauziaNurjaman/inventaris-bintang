<?php

namespace App\Http\Controllers\Laporan;

use App\Exports\BarangKeluarExport;
use App\Http\Controllers\Controller;
use App\Models\View\ViewBarangKeluar;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class LaporanBarangKeluarController extends Controller
{
    public function index(Request $request)
    {

        $query = ViewBarangKeluar::query();
        $filters = $request->only('start_date', 'end_date', 'lokasi_id', 'search');

        if ($request->filled('lokasi_id')) {
            $query->where('view_barang_keluar.lokasi_id', $request->lokasi_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('view_barang_keluar.tanggal', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('view_barang_keluar.tanggal', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('view_barang_keluar.tanggal', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                 $q->whereRaw('LOWER(view_barang_keluar.serial_number) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(model) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(merek) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(lokasi_nama) LIKE ?', ["%{$search}%"]);
            });
        }

        $barangKeluarData = $query->orderBy('tanggal', 'desc')->paginate(15)->withQueryString();

        
            $data = [
            'barangKeluarData' => $barangKeluarData,
            'filters' => $filters,
            'lokasiList' => \App\Models\Lokasi::select('id', 'nama')->orderBy('nama')->get(),
        ];

        return Inertia::render('laporan/barang-keluar/index', $data);
    }

    public function exportBarangKeluarExcel(Request $request)
    {
        return Excel::download(new BarangKeluarExport($request->all()), 'laporan_barang_keluar_'.now()->format('Y-m-d').'.xlsx');
    }

    public function exportBarangKeluarPdf(Request $request)
    {
        $query = ViewBarangKeluar::query()
            ->select(
                'view_barang_keluar.*',
                'm.nama as merek_nama_real',
                'mb.nama as model_nama_real',
                'jb.nama as jenis_nama',
                'sl.nama as sub_lokasi_nama'
            )
            ->join('barang as b', 'view_barang_keluar.serial_number', '=', 'b.serial_number')
            ->leftJoin('model_barang as mb', 'b.model_id', '=', 'mb.id')
            ->leftJoin('merek_barang as m', 'mb.merek_id', '=', 'm.id')
            ->leftJoin('jenis_barang as jb', 'b.jenis_barang_id', '=', 'jb.id')
            ->leftJoin('sub_lokasi as sl', 'b.sub_lokasi_id', '=', 'sl.id');
        $filters = $request->only('start_date', 'end_date', 'lokasi_id', 'search');

        if ($request->filled('lokasi_id')) {
            $query->where('view_barang_keluar.lokasi_id', $request->lokasi_id);
        }

          if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('view_barang_keluar.tanggal', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('view_barang_keluar.tanggal', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('view_barang_keluar.tanggal', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                 $q->whereRaw('LOWER(view_barang_keluar.serial_number) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(model) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(merek) LIKE ?', ["%{$search}%"])
                   ->orWhereRaw('LOWER(lokasi_nama) LIKE ?', ["%{$search}%"]);
            });
        }

        $barangKeluarData = $query->orderBy('tanggal', 'desc')->get();

        $lokasi = null;
        if ($request->filled('lokasi_id')) {
            $lokasi = \App\Models\Lokasi::find($request->lokasi_id);
        }

        $pdf = Pdf::loadView('reports.barang_keluar_pdf', [
            'barangKeluarData' => $barangKeluarData,
            'filters' => $request->all(),
            'lokasi' => $lokasi,
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ]);

        return $pdf->stream('laporan_barang_keluar_'.now()->format('Y-m-d').'.pdf');
    }

}
