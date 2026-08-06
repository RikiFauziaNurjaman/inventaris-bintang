<?php

namespace App\Http\Controllers\Stock\Gudang;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\RekapStokBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class StockDiperbaikiController extends Controller
{
    public function index()
    {
        $stokPerbaikan = RekapStokBarang::with([
                'lokasi' => fn($q) => $q->where('is_gudang', true),
                'modelBarang.kategori',
                'modelBarang.merek',
            ])
            ->whereHas('lokasi', fn($q) => $q->where('is_gudang', true))
            ->where('jumlah_perbaikan', '>', 0)
            ->get()
            ->map(fn($item) => [
                'model_id' => $item->model_id,
                'lokasi_id' => $item->lokasi_id,
                'lokasi' => $item->lokasi->nama,
                'kategori' => $item->modelBarang->kategori->nama ?? '-',
                'nama_barang' => trim(($item->modelBarang->merek->nama ?? '') . ' ' . $item->modelBarang->nama),
                'jumlah_perbaikan' => $item->jumlah_perbaikan,
            ]);

        return Inertia::render('stock/perbaikan/index', [
            'stokPerbaikan' => $stokPerbaikan,
        ]);
    }

    public function show(Request $request)
    {
        $request->validate([
            'model_id' => 'required|integer',
            'lokasi_id' => 'required|integer',
        ]);

        $detailBarang = Barang::where('model_id', $request->model_id)
            ->where('lokasi_id', $request->lokasi_id)
            ->where('status', 'diperbaiki')
            ->select('id', 'serial_number', 'kondisi_awal', 'catatan as keterangan')
            ->get();

        return response()->json($detailBarang);
    }

    public function selesaiDiperbaiki(Request $request)
    {
        $validated = $request->validate([
            'barang_ids'   => 'required|array|min:1',
            'barang_ids.*' => 'required|integer|exists:barang,id',
        ]);

        // Ambil semua data barang yang akan diupdate dalam satu query
        $barangToUpdate = Barang::whereIn('id', $validated['barang_ids'])
                                ->where('status', 'diperbaiki') // Keamanan ekstra
                                ->get();

        if ($barangToUpdate->count() !== count($validated['barang_ids'])) {
             return Redirect::back()->with('error', 'Beberapa barang tidak ditemukan atau statusnya bukan dalam perbaikan.');
        }

        $firstBarang = $barangToUpdate->first();
        $model_id = $firstBarang->model_id;
        $lokasi_id = $firstBarang->lokasi_id;
        $jumlah = $barangToUpdate->count();

        try {
            DB::transaction(function () use ($validated, $model_id, $lokasi_id, $jumlah) {
                // 2. Update rekap stok
                $rekap = RekapStokBarang::where('model_id', $model_id)
                    ->where('lokasi_id', $lokasi_id)
                    ->firstOrFail();

                $rekap->jumlah_perbaikan -= $jumlah;
                $rekap->jumlah_tersedia += $jumlah;
                $rekap->save();

                Barang::whereIn('id', $validated['barang_ids'])
                      ->update(['status' => 'bagus']);
            });
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Gagal memperbarui stok: ' . $e->getMessage());
        }

        return Redirect::back()->with('success', "$jumlah barang berhasil diperbarui dan dikembalikan ke stok.");
    }
}
