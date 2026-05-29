<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DataBarangController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'DataBarangController_' . md5(json_encode(request()->all()));
        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($request) {

        $query = DB::table('barang')
            ->leftJoin('model_barang', 'barang.model_id', '=', 'model_barang.id')
            ->leftJoin('merek_barang', 'model_barang.merek_id', '=', 'merek_barang.id')
            ->leftJoin('kategori_barang', 'model_barang.kategori_id', '=', 'kategori_barang.id')
            ->leftJoin('rak_barang', 'barang.rak_id', '=', 'rak_barang.id')
            ->leftJoin('lokasi', 'barang.lokasi_id', '=', 'lokasi.id')
            ->select([
                'barang.id',
                'barang.serial_number',
                DB::raw("CONCAT(merek_barang.nama, ' - ', model_barang.nama) AS merek_model"),
                'kategori_barang.nama as kategori',
                'rak_barang.nama_rak',
                'rak_barang.kode_rak',
                'rak_barang.baris',
                'barang.status as status_awal',
                'barang.kondisi_awal as kondisi',
                'lokasi.nama as lokasi',
            ]);

        if ($search = $request->input('search')) {
            $search = strtolower($search);

            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(barang.serial_number) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(model_barang.nama) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(merek_barang.nama) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(kategori_barang.nama) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(lokasi.nama) LIKE ?', ["%{$search}%"]);
            });
        }


        if ($kategori = $request->input('kategori')) {
            $query->where('kategori_barang.nama', $kategori);
        }

        if ($lokasi = $request->input('lokasi')) {
            $query->where('lokasi.nama', $lokasi);
        }

        if ($status = $request->input('status')) {
            $query->where('barang.status', $status);
        }

        if ($kondisi = $request->input('kondisi')) {
            $query->where('barang.kondisi_awal', $kondisi);
        }


        $query->orderByDesc('lokasi.is_gudang')
            ->orderBy('kategori_barang.nama')
            ->orderBy('merek_barang.nama')
            ->orderBy('model_barang.nama')
            ->orderBy('rak_barang.nama_rak')
            ->orderBy('rak_barang.kode_rak')
            ->orderBy('rak_barang.baris')
            ->orderBy('barang.status')
            ->orderBy('barang.kondisi_awal')
            ->orderBy('lokasi.nama');

        $barang = $query->paginate(20)->withQueryString();

        $filterOptions = [
            'kategoriList' => DB::table('kategori_barang')->pluck('nama'),
            'lokasiList' => DB::table('lokasi')->pluck('nama'),
            'statusList' => DB::table('barang')->distinct()->pluck('status'),
            'kondisiList' => DB::table('barang')->distinct()->pluck('kondisi_awal'),
        ];

        
            return [
            'barangList' => $barang,
            'filters' => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'filterOptions' => $filterOptions,
        ];
        });

        return Inertia::render('master/barang/index', $data);
    }

    public function destroy($id)
    {
        $barang = DB::table('barang')->where('id', $id);

        if ($barang->doesntExist()) {
            return redirect()->back()->with('error', 'Data barang tidak ditemukan.');
        }

        $barang->delete();

        return redirect()->route('barang.index')->with('success', 'Data barang berhasil dihapus.');
    }

}
