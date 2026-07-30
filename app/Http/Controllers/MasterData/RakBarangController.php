<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\MasterDataHelper;
use App\Http\Controllers\Controller;
use App\Models\RakBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RakBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_RAK_BARANG->value)->only(['index', 'show', 'search']);
        $this->middleware('can:'.PermissionEnum::CREATE_RAK_BARANG->value)->only(['create', 'store']);
        $this->middleware('can:'.PermissionEnum::EDIT_RAK_BARANG->value)->only(['edit', 'update']);
        $this->middleware('can:'.PermissionEnum::DELETE_RAK_BARANG->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $rakList = RakBarang::with('lokasi:id,nama')->applyCaseInsensitiveSearch(
            $request,
            ['nama_rak', 'baris']
        )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $lokasiList = MasterDataHelper::getLokasiGudang();

        return Inertia::render('master/rak-barang/index', [
            'rakList' => $rakList,
            'lokasiList' => $lokasiList,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function create()
    {
        $lokasiList = MasterDataHelper::getLokasiGudang();

        return Inertia::render('gudang/rak-barang/Create', [
            'lokasiList' => $lokasiList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'nama_rak' => 'required|string',
            'baris' => 'nullable|string',
            'kode_rak' => 'required|string|unique:rak_barang,kode_rak',
        ]);

        RakBarang::create($request->all());
        MasterDataHelper::clearAllCaches();

        return redirect()->route('rak-barang.index')->with('success', 'Rak berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $rak = RakBarang::findOrFail($id);
        $lokasiList = MasterDataHelper::getLokasiGudang();

        return Inertia::render('gudang/rak-barang/Edit', [
            'rak' => $rak,
            'lokasiList' => $lokasiList,
        ]);
    }

    public function update(Request $request, $id)
    {
        $rak = RakBarang::findOrFail($id);

        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'nama_rak' => 'required|string',
            'baris' => 'nullable|string',
            'kode_rak' => 'required|string|unique:rak_barang,kode_rak,'.$rak->id,
        ]);

        $rak->update($request->all());
        MasterDataHelper::clearAllCaches();

        return redirect()->route('rak-barang.index')->with('success', 'Rak berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $rak = RakBarang::findOrFail($id);
        $rak->delete();
        MasterDataHelper::clearAllCaches();

        return redirect()->route('rak-barang.index')->with('success', 'Rak berhasil dihapus.');
    }
}
