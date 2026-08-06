<?php

namespace App\Http\Controllers\Stock\Gudang;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Pemusnahan;
use App\Models\RekapStokBarang;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class StockRusakController extends Controller
{
    public function index()
    {
        $stokRusak = RekapStokBarang::with([
                'lokasi' => fn($q) => $q->where('is_gudang', true),
                'modelBarang.kategori',
                'modelBarang.merek',
            ])
            ->whereHas('lokasi', fn($q) => $q->where('is_gudang', true))
            ->where('jumlah_rusak', '>', 0)
            ->get()
            ->map(fn($item) => [
                'model_id'      => $item->model_id,
                'lokasi_id'     => $item->lokasi_id,
                'lokasi' => $item->lokasi->nama,
                'kategori' => $item->modelBarang->kategori->nama ?? '-',
                'nama_barang' => trim(($item->modelBarang->merek->nama ?? '') . ' ' . $item->modelBarang->nama),
                'jumlah_rusak' => $item->jumlah_rusak,
            ]);

        return Inertia::render('stock/rusak/index', [
            'stokRusak' => $stokRusak,
        ]);
    }

    public function show(Request $request)
    {
        $request->validate([
            'model_id' => 'required|integer|exists:model_barang,id',
            'lokasi_id' => 'required|integer|exists:lokasi,id',
        ]);

        $detailBarang = Barang::where('model_id', $request->model_id)
            ->where('lokasi_id', $request->lokasi_id)
            ->where('status', 'rusak')
            ->select('id', 'serial_number', 'catatan as keterangan')
            ->get();

        return response()->json($detailBarang);
    }

    public function perbaiki(Request $request)
    {
        $validated = $request->validate([
            'barang_ids'   => 'required|array|min:1',
            'barang_ids.*' => 'required|integer|exists:barang,id',
        ]);

        $barangPilihan = Barang::whereIn('id', $validated['barang_ids'])->where('status', 'rusak')->get();
        if ($barangPilihan->isEmpty()) {
            return Redirect::back()->with('error', 'Barang tidak ditemukan atau sudah tidak berstatus rusak.');
        }

        $jumlah = $barangPilihan->count();
        $model_id = $barangPilihan->first()->model_id;
        $lokasi_id = $barangPilihan->first()->lokasi_id;

        DB::transaction(function () use ($barangPilihan, $model_id, $lokasi_id, $jumlah) {
            // 1. Update Rekap Stok
            $rekap = RekapStokBarang::where('model_id', $model_id)->where('lokasi_id', $lokasi_id)->firstOrFail();
            $rekap->jumlah_rusak -= $jumlah;
            $rekap->jumlah_perbaikan += $jumlah;
            $rekap->save();

            // 2. Update Status Barang Individual
            $barangPilihan->each->update(['status' => 'diperbaiki']);
        });

        return Redirect::back()->with('success', "$jumlah barang berhasil dipindahkan ke daftar perbaikan.");
    }

    public function ajukanPemusnahan(Request $request)
    {
        $validated = $request->validate([
            'barang_ids'   => 'required|array|min:1',
            'barang_ids.*' => 'required|integer|exists:barang,id',
            'alasan'       => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Buat record Berita Acara Pemusnahan
            $pemusnahan = Pemusnahan::create([
                'user_id' => Auth::id(),
                'tanggal_pemusnahaan' => Carbon::now(),
                'alasan' => $validated['alasan'],
                'status' => 'pending',
                'kode_pemusnahaan' => 'BAP-' . date('Ymd-His'),
            ]);

            $pemusnahan->barang()->attach($validated['barang_ids']);

            Barang::whereIn('id', $validated['barang_ids'])->update(['status' => 'menunggu']);
        });

        return redirect()->back()->with('success', 'Pengajuan pemusnahan berhasil dibuat dan menunggu persetujuan.');
    }

    public function indexPemusnahan()
    {
        $daftarPemusnahan = Pemusnahan::with(['user', 'barang', 'approver'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        return Inertia::render('stock/pemusnahan/index', [
            'daftarPemusnahan' => $daftarPemusnahan,
        ]);
    }

    public function approvePemusnahan(Pemusnahan $pemusnahan)
    {
        if ($pemusnahan->status !== 'pending') {
            return redirect()->route('stock.rusak.pemusnahan.index')->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($pemusnahan) {
            $barangPilihan = $pemusnahan->barang;
            $jumlah = $barangPilihan->count();

            // Lakukan hanya jika ada barang yang terhubung
            if ($jumlah > 0) {
                $model_id = $barangPilihan->first()->model_id;
                $lokasi_id = $barangPilihan->first()->lokasi_id;

                // 1. Update Rekap Stok (logika sama seperti sebelumnya)
                $rekap = RekapStokBarang::where('model_id', $model_id)->where('lokasi_id', $lokasi_id)->firstOrFail();

                $rekap->jumlah_rusak -= $jumlah;
                $rekap->jumlah_total -= $jumlah;
                $rekap->save();

                // 2. Update status barang menjadi DIMUSNAHKAN
                $barangPilihan->each->update(['status' => 'dimusnahkan']);
            }

            // 3. Update status berita acara pemusnahan
            $pemusnahan->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
            ]);
        });

        return redirect()->route('stock.rusak.pemusnahan.index')->with('success', 'Pengajuan pemusnahan berhasil disetujui dan stok telah diperbarui.');
    }

}
