<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarangMasukDetail extends Model
{
    public $timestamps = false;

    protected $table = 'barang_masuk_detail';

    protected $fillable = ['barang_masuk_id', 'barang_id', 'keterangan'];

    public function barangMasuk()
    {
        return $this->belongsTo(BarangMasuk::class);
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }
}
