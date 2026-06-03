<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\MasterDataHelper;
use App\Http\Controllers\Controller;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ModelBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:' . PermissionEnum::VIEW_MODEL->value)->only(['index', 'show', 'search']);
        $this->middleware('can:' . PermissionEnum::CREATE_MODEL->value)->only(['create', 'store']);
        $this->middleware('can:' . PermissionEnum::EDIT_MODEL->value)->only(['edit', 'update']);
        $this->middleware('can:' . PermissionEnum::DELETE_MODEL->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $model = ModelBarang::with(['kategori:id,nama', 'merek:id,nama', 'jenis:id,nama'])
            ->applyCaseInsensitiveSearch($request, ['nama', 'label', 'kategori.nama'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Label list
        $labelList = ModelBarang::selectRaw('label, COUNT(*) as total')
                ->whereNotNull('label')
                ->groupBy('label')
                ->orderByDesc('total')
                ->limit(20)
                ->pluck('label')
                ->toArray();

        return Inertia::render('master/model/index', [
            'modelBarang' => $model,
            'kategori' => MasterDataHelper::getKategoriList(),
            'merek' => MasterDataHelper::getMerekList(),
            'jenis' => MasterDataHelper::getJenisList(),
            'labelList' => $labelList,
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
        $merek = MerekBarang::applyCaseInsensitiveSearch($request, ['nama', 'label', 'kategori.nama'])
            ->latest()
            ->paginate(10);

        return response()->json($merek);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:model_barang,nama',
            'kategori_id' => 'required|exists:kategori_barang,id',
            'merek_id' => 'required|exists:merek_barang,id',
            'jenis_id' => 'nullable|exists:jenis_barang,id',
            'deskripsi' => 'nullable|string|max:500',
            'label'     => 'nullable|string',
        ]);

        ModelBarang::create($request->only('nama', 'kategori_id', 'merek_id', 'jenis_id', 'deskripsi', 'label'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('model.index')->with('message', 'Model Barang berhasil ditambahkan.');
    }

    public function update(Request $request, ModelBarang $model)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:model_barang,nama,' . $model->id,
            'kategori_id' => 'required|exists:kategori_barang,id',
            'merek_id' => 'required|exists:merek_barang,id',
            'jenis_id' => 'nullable|exists:jenis_barang,id',
            'deskripsi' => 'nullable|string|max:500',
            'label'     => 'nullable|string',
        ]);

        $model->update($request->only('nama', 'kategori_id', 'merek_id', 'jenis_id', 'deskripsi', 'label'));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('model.index')->with('message', 'Model Barang berhasil diperbarui.');
    }

    public function destroy(ModelBarang $model)
    {
        $model->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Model Barang berhasil dihapus.');
    }
}
