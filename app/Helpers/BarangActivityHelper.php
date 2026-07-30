<?php

namespace App\Helpers;

use App\Models\Barang;
use App\Models\BarangKeluarDetail;
use App\Models\BarangKembaliDetail;
use App\Models\BarangMasukDetail;
use App\Models\MutasiBarang;
use App\Models\RiwayatStatusBarang;
use App\Models\StockOpnameDetail;
use App\Models\StockOpnameItem;
use Illuminate\Support\Facades\DB;

class BarangActivityHelper
{
    public static function blockReason(Barang $barang): ?string
    {
        if ($barang->status !== 'baik') {
            $status = ucfirst(str_replace('_', ' ', $barang->status));

            return "status saat ini “{$status}”";
        }

        if (BarangMasukDetail::where('barang_id', $barang->id)->count() !== 1) {
            return 'catatan barang masuk tidak lengkap';
        }

        $mutasi = MutasiBarang::where('barang_id', $barang->id)->get();
        if ($mutasi->count() !== 1 || $mutasi->first()->lokasi_asal_id !== null) {
            return 'sudah memiliki riwayat perpindahan';
        }

        if (
            BarangKeluarDetail::where('barang_id', $barang->id)->exists()
            || BarangKembaliDetail::where('barang_id', $barang->id)->exists()
            || RiwayatStatusBarang::where('barang_id', $barang->id)->exists()
            || DB::table('barang_pemusnahan')->where('barang_id', $barang->id)->exists()
            || StockOpnameDetail::whereJsonContains('serial_hilang', $barang->serial_number)->exists()
            || StockOpnameDetail::whereJsonContains('serial_baru', $barang->serial_number)->exists()
            || StockOpnameItem::where('barang_id', $barang->id)
                ->orWhere('normalized_serial', strtoupper(trim($barang->serial_number)))
                ->exists()
        ) {
            return 'sudah tercatat dalam aktivitas inventaris';
        }

        return null;
    }
}
