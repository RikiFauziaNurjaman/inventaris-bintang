<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\View\ViewBarangKeluar;
use App\Models\View\ViewBarangKembali;
use App\Models\View\ViewBarangMasuk;
use App\Models\View\ViewMutasiBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanSummaryController extends Controller
{
    public function index()
    {

        $summaries = [
            'barang_masuk' => ViewBarangMasuk::count(),
            'barang_keluar' => ViewBarangKeluar::count(),
            'barang_kembali' => ViewBarangKembali::count(),
            'mutasi_barang' => ViewMutasiBarang::count(),
        ];

        
            return [
            'summary' => $summaries
        ];

        return Inertia::render('laporan/index', $data);
    }
}
