<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Helpers\MasterDataHelper;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class KategoriBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:' . PermissionEnum::VIEW_KATEGORI->value)->only(['index', 'show', 'search']);
        $this->middleware('can:' . PermissionEnum::CREATE_KATEGORI->value)->only(['create', 'store']);
        $this->middleware('can:' . PermissionEnum::EDIT_KATEGORI->value)->only(['edit', 'update']);
        $this->middleware('can:' . PermissionEnum::DELETE_KATEGORI->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $cacheKey = 'KategoriBarangController_' . md5(json_encode(request()->all()));
        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($request) {

        $kategori = KategoriBarang::applyCaseInsensitiveSearch(
                $request,
                ['nama']
        )
        ->latest()
        ->paginate(10)
        ->withQueryString();

        
            return [
            'kategori' => $kategori,
            'filters'   => [
                'search'    => $request->input('search'),
            ],
        ];
        });

        // Flash message tidak bisa di-cache, tambahkan di luar cache
        $data['flash'] = [
            'message' => session('message'),
        ];

        return Inertia::render('master/kategori/index', $data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:kategori_barang,nama',
        ]);

        KategoriBarang::create($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('kategori.index')->with('message', 'Kategori Barang berhasil ditambahkan.');
    }

    public function update(Request $request, KategoriBarang $kategori)
    {

        $request->validate([
            'nama' => 'required|string|max:255|unique:kategori_barang,nama,' . $kategori->id,
        ]);

        $kategori->update($request->only('nama'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('kategori.index')->with('message', 'Kategori Barang berhasil diperbarui.');
    }

    public function destroy(KategoriBarang $kategori)
    {
        $kategori->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Kategori Barang berhasil dihapus.');
    }
}
