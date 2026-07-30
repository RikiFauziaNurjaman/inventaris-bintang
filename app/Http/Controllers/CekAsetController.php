<?php

namespace App\Http\Controllers;

use App\Enums\PermissionEnum;
use App\Models\Barang;
use App\Models\Lokasi;
use Illuminate\Http\Request;

class CekAsetController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_BARANG_INVENTARIS->value);
    }

    public function index()
    {
        return inertia('cek-aset/index', [
            'lokasi' => Lokasi::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function lookup(Request $request)
    {
        $validated = $request->validate([
            'serial_number' => ['required', 'string', 'max:255'],
            'lokasi_id' => ['nullable', 'integer', 'exists:lokasi,id'],
        ]);

        $serial = mb_strtoupper(trim($validated['serial_number']));
        $barang = Barang::with([
            'modelBarang.merek:id,nama',
            'lokasi:id,nama',
            'rak:id,nama_rak,kode_rak',
            'subLokasi:id,nama',
        ])->whereRaw('UPPER(TRIM(serial_number)) = ?', [$serial])->first();

        if (! $barang) {
            return response()->json([
                'registered' => false,
                'serial_number' => trim($validated['serial_number']),
            ]);
        }

        return response()->json([
            'registered' => true,
            'location_match' => empty($validated['lokasi_id']) ? null : $barang->lokasi_id === (int) $validated['lokasi_id'],
            'barang' => [
                'id' => $barang->id,
                'serial_number' => $barang->serial_number,
                'model' => $barang->modelBarang?->nama,
                'merek' => $barang->modelBarang?->merek?->nama,
                'status' => $barang->status,
                'lokasi' => $barang->lokasi?->nama,
                'rak' => $barang->rak ? trim($barang->rak->nama_rak.' '.$barang->rak->kode_rak) : null,
                'sub_lokasi' => $barang->subLokasi?->nama,
            ],
        ]);
    }
}
