<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\MasterDataHelper;
use App\Http\Controllers\Controller;
use App\Models\AsalBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AsalBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_ASAL_BARANG->value)->only(['index', 'show', 'search']);
        $this->middleware('can:'.PermissionEnum::CREATE_ASAL_BARANG->value)->only(['create', 'store']);
        $this->middleware('can:'.PermissionEnum::EDIT_ASAL_BARANG->value)->only(['edit', 'update']);
        $this->middleware('can:'.PermissionEnum::DELETE_ASAL_BARANG->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $asalBarang = AsalBarang::applyCaseInsensitiveSearch(
            $request,
            ['nama']
        )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/asal-barang/index', [
            'asal' => $asalBarang,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:asal_barang,nama',
        ]);

        AsalBarang::create($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('asal-barang.index')->with('message', 'Asal Barang berhasil ditambahkan.');
    }

    public function update(Request $request, AsalBarang $asalBarang)
    {

        $request->validate([
            'nama' => 'required|string|max:255|unique:asal_barang,nama,'.$asalBarang->id,
        ]);

        $asalBarang->update($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('asal-barang.index')->with('message', 'Asal Barang berhasil diperbarui.');
    }

    public function destroy(AsalBarang $asalBarang)
    {
        $asalBarang->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Asal Barang berhasil dihapus.');
    }
}
