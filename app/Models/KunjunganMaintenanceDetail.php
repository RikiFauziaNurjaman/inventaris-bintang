<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KunjunganMaintenanceDetail extends Model
{
    use HasFactory;

    protected $table = 'kunjungan_maintenance_detail';

    protected $fillable = [
        'kunjungan_id',
        'barang_id',
        'sub_lokasi_id',
        'kondisi_sebelumnya',
        'kondisi_fisik',
        'status_operasional',
        'counter_cetak',
        'kondisi_print_head',
        'kondisi_tinta_ribbon',
        'kondisi_roller_mekanikal',
        'tindakan',
        'catatan',
        'sync_status_barang',
    ];

    protected $casts = [
        'counter_cetak' => 'integer',
        'sync_status_barang' => 'boolean',
    ];

    public function kunjungan()
    {
        return $this->belongsTo(KunjunganMaintenance::class, 'kunjungan_id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function subLokasi()
    {
        return $this->belongsTo(SubLokasi::class, 'sub_lokasi_id');
    }
}
