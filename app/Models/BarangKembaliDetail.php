<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarangKembaliDetail extends Model
{
    public $timestamps = false;

    protected $table = 'barang_kembali_detail';

    protected $fillable = ['barang_kembali_id', 'barang_id', 'kondisi', 'status_saat_kembali', 'kondisi_awal_saat_kembali', 'keterangan'];

    public function barangKembali()
    {
        return $this->belongsTo(BarangKembali::class);
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }
}
