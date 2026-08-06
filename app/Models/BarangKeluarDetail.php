<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarangKeluarDetail extends Model
{
    public $timestamps = false;
    protected $table = 'barang_keluar_detail';

    protected $fillable = ['barang_keluar_id', 'barang_id', 'status_keluar', 'keterangan'];

    public function barangKeluar()
    {
        return $this->belongsTo(BarangKeluar::class, 'barang_keluar_id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
