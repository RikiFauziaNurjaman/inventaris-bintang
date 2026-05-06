<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\MasterDataHelper;
use App\Http\Controllers\Controller;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class JenisBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:' . PermissionEnum::VIEW_JENIS->value)->only(['index', 'show', 'search']);
        $this->middleware('can:' . PermissionEnum::CREATE_JENIS->value)->only(['create', 'store']);
        $this->middleware('can:' . PermissionEnum::EDIT_JENIS->value)->only(['edit', 'update']);
        $this->middleware('can:' . PermissionEnum::DELETE_JENIS->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $jenis = JenisBarang::with('kategori:id,nama')
            ->applyCaseInsensitiveSearch($request, ['nama', 'kategori.nama'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/jenis-barang/index', [
            'jenisBarang' => $jenis,
            'kategoriBarang' => MasterDataHelper::getKategoriList(),
            'filters' => [
                'search' => $request->input('search'),
            ],
            'flash' => [
                'message' => session('message'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:jenis_barang,nama',
            'kategori_id' => 'required|exists:kategori_barang,id',
        ]);

        JenisBarang::create($request->only('nama', 'kategori_id'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('jenis-barang.index')->with('message', 'Jenis Barang berhasil ditambahkan.');
    }

    public function update(Request $request, JenisBarang $jenisBarang)
    {
        $request->validate([
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('jenis_barang', 'nama')->ignore($jenisBarang->id),
            ],
            'kategori_id' => 'required|exists:kategori_barang,id',
        ]);

        $jenisBarang->update($request->only('nama', 'kategori_id'));
        MasterDataHelper::clearAllCaches();

        return redirect()->route('jenis-barang.index')->with('message', 'Jenis Barang berhasil diperbarui.');
    }

    public function destroy(JenisBarang $jenisBarang)
    {
        $jenisBarang->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Jenis Barang berhasil dihapus.');
    }

    /**
     * API endpoint untuk mendapatkan jenis barang berdasarkan kategori.
     * Digunakan untuk cascade filter di form.
     */
    public function getByKategori(Request $request)
    {
        $kategoriId = $request->input('kategori_id');
        
        if (!$kategoriId) {
            return response()->json([]);
        }

        $jenis = JenisBarang::where('kategori_id', $kategoriId)
            ->select('id', 'nama')
            ->orderBy('nama')
            ->get();

        return response()->json($jenis);
    }
}
