<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarangKembali extends Model
{
    use HasFactory;

    protected $table = 'barang_kembali';

    protected $fillable = ['tanggal', 'lokasi_id', 'user_id'];

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function details()
    {
        return $this->hasMany(BarangKembaliDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

