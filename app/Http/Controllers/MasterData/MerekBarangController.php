<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Helpers\MasterDataHelper;
use App\Models\MerekBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class MerekBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:' . PermissionEnum::VIEW_MEREK->value)->only(['index', 'show', 'search']);
        $this->middleware('can:' . PermissionEnum::CREATE_MEREK->value)->only(['create', 'store']);
        $this->middleware('can:' . PermissionEnum::EDIT_MEREK->value)->only(['edit', 'update']);
        $this->middleware('can:' . PermissionEnum::DELETE_MEREK->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $merek = MerekBarang::query()
            ->applyCaseInsensitiveSearch($request, ['nama'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/merek/index', [
            'merek' => $merek,
            'filters' => [
                'search' => $request->input('search'),
            ],
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    public function search(Request $request)
    {
        $merek = MerekBarang::applyCaseInsensitiveSearch($request, ['nama'])
            ->latest()
            ->paginate(10);

        return response()->json($merek);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:merek_barang,nama',
        ]);

        MerekBarang::create($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('merek.index')->with('message', 'Merek Barang berhasil ditambahkan.');
    }

    public function update(Request $request, MerekBarang $merek)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:merek_barang,nama,' . $merek->id,
        ]);

        $merek->update($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('merek.index')->with('message', 'Merek Barang berhasil diperbarui.');
    }

    public function destroy(MerekBarang $merek)
    {
        $merek->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Merek Barang berhasil dihapus.');
    }
}
