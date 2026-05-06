<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Helpers\MasterDataHelper;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LokasiBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:' . PermissionEnum::VIEW_LOKASI_DISTRIBUSI->value)->only(['index', 'show', 'search']);
        $this->middleware('can:' . PermissionEnum::CREATE_LOKASI_DISTRIBUSI->value)->only(['create', 'store']);
        $this->middleware('can:' . PermissionEnum::EDIT_LOKASI_DISTRIBUSI->value)->only(['edit', 'update']);
        $this->middleware('can:' . PermissionEnum::DELETE_LOKASI_DISTRIBUSI->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $lokasi = Lokasi::applyCaseInsensitiveSearch(
                $request,
                ['nama']
        )
        ->latest()
        ->paginate(10)
        ->withQueryString();
        return Inertia::render('master/lokasi/index', [
            'lokasi' => $lokasi,
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
            'nama' => 'required|string|max:255|unique:lokasi,nama',
            'alamat' => 'required|string|max:255',
        ]);

        Lokasi::create($request->only(['nama', 'alamat']));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('lokasi.index')->with('message', 'Lokasi berhasil ditambahkan.');
    }

    public function update(Request $request, Lokasi $lokasi)
    {

        $request->validate([
            'nama' => 'required|string|max:255|unique:lokasi,nama,' . $lokasi->id,
            'alamat' => 'nullable|string|max:255',
        ]);

        $lokasi->update($request->only(['nama', 'alamat']));
        MasterDataHelper::clearAllCaches();

        return Redirect::route('lokasi.index')->with('message', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(Lokasi $lokasi)
    {
        $lokasi->delete();
        MasterDataHelper::clearAllCaches();

        return Redirect::back()->with('message', 'Lokasi berhasil dihapus.');
    }
}

