<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpnameItem extends Model
{
    protected $table = 'stock_opname_item';

    protected $fillable = [
        'stock_opname_id',
        'barang_id',
        'model_id',
        'serial_number',
        'normalized_serial',
        'state',
        'status_snapshot',
        'scanned_by',
        'scanned_at',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];

    public function stockOpname()
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function modelBarang()
    {
        return $this->belongsTo(ModelBarang::class, 'model_id');
    }

    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }
}
