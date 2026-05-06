<?php

namespace App\Models;

use App\Traits\HasCaseInsensitiveSearch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
     use HasCaseInsensitiveSearch;

    use HasFactory;
    protected $table = 'barang';
    protected $fillable = [
        'jenis_barang_id', 'asal_id', 'lokasi_id', 'sub_lokasi_id', 'model_id',
        'serial_number', 'kondisi_awal', 'status', 'pic', 'catatan', 'rak_id'
    ];

    public function jenisBarang()
    {
        return $this->belongsTo(JenisBarang::class);
    }


    public function asal()
    {
        return $this->belongsTo(AsalBarang::class, 'asal_id');
    }

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function subLokasi()
    {
        return $this->belongsTo(SubLokasi::class, 'sub_lokasi_id');
    }

    public function modelBarang()
    {
        return $this->belongsTo(ModelBarang::class, 'model_id');
    }

    public function rak()
    {
        return $this->belongsTo(RakBarang::class, 'rak_id');
    }

    public function pemusnahan()
    {
        return $this->belongsToMany(Pemusnahan::class, 'barang_pemusnahan');
    }

    public function mutasi()
    {
        return $this->hasMany(MutasiBarang::class, 'barang_id');
    }

}

