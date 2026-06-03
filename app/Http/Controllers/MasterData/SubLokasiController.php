<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Lokasi;
use App\Models\SubLokasi;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class SubLokasiController extends Controller
{
    public function index(Request $request)
    {
        $query = SubLokasi::with('lokasi:id,nama')
            ->applyCaseInsensitiveSearch($request, ['nama', 'kode', 'lantai']);

        if ($request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        $subLokasi = $query->orderBy('lokasi_id')
            ->orderBy('nama')
            ->paginate(20)
            ->withQueryString();

        $lokasiList = Lokasi::where('is_gudang', false)
            ->select('id', 'nama')
            ->orderBy('nama')
            ->get();

        return Inertia::render('master/sub-lokasi/index', [
            'subLokasi' => $subLokasi,
            'lokasiList' => $lokasiList,
            'filters' => $request->only(['search', 'lokasi_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50',
            'lantai' => 'nullable|string|max:20',
            'keterangan' => 'nullable|string',
        ]);

        SubLokasi::create($validated);
        


        return Redirect::back()->with('message', 'Sub-Lokasi berhasil ditambahkan.');
    }

    public function update(Request $request, SubLokasi $subLokasi)
    {
        $validated = $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50',
            'lantai' => 'nullable|string|max:20',
            'keterangan' => 'nullable|string',
        ]);

        $subLokasi->update($validated);

        return Redirect::back()->with('message', 'Sub-Lokasi berhasil diperbarui.');
    }

    public function destroy(SubLokasi $subLokasi)
    {
        $subLokasi->delete();

        return Redirect::back()->with('message', 'Sub-Lokasi berhasil dihapus.');
    }

    /**
     * API endpoint untuk mendapatkan sub-lokasi berdasarkan lokasi.
     * Digunakan untuk cascade filter di form.
     */
    public function getByLokasi(Request $request)
    {
        $lokasiId = $request->input('lokasi_id');
        
        if (!$lokasiId) {
            return response()->json([]);
        }

        $subLokasi = SubLokasi::where('lokasi_id', $lokasiId)
            ->select('id', 'nama', 'kode', 'lantai')
            ->orderBy('nama')
            ->get();

        return response()->json($subLokasi);
    }
}
