<?php

namespace App\Models;

use App\Traits\HasCaseInsensitiveSearch;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KunjunganMaintenance extends Model
{
    use HasFactory, HasCaseInsensitiveSearch;

    protected $table = 'kunjungan_maintenance';

    protected $fillable = [
        'nomor_kunjungan',
        'lokasi_id',
        'user_id',
        'nama_teknisi',
        'tanggal_kunjungan',
        'periode_bulan',
        'jadwal_berikutnya',
        'status',
        'pic_lokasi',
        'kontak_pic',
        'catatan',
    ];

    protected $casts = [
        'tanggal_kunjungan' => 'date:Y-m-d',
        'jadwal_berikutnya' => 'date:Y-m-d',
        'periode_bulan' => 'integer',
    ];

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function details()
    {
        return $this->hasMany(KunjunganMaintenanceDetail::class, 'kunjungan_id');
    }

    /**
     * Generate nomor kunjungan otomatis: MTC-YYYYMM-XXXX
     */
    public static function generateNomorKunjungan(): string
    {
        $prefix = 'MTC-' . date('Ym') . '-';
        $last = self::where('nomor_kunjungan', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('nomor_kunjungan');

        if ($last) {
            $lastNumber = (int) substr($last, -4);
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return $prefix . $nextNumber;
    }
}
