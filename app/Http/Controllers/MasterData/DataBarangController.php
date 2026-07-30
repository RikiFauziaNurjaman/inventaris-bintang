<?php

namespace App\Http\Controllers\MasterData;

use App\Enums\PermissionEnum;
use App\Helpers\MasterDataHelper;
use App\Helpers\StockHelpers;
use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluarDetail;
use App\Models\BarangKembaliDetail;
use App\Models\BarangMasuk;
use App\Models\BarangMasukDetail;
use App\Models\ModelBarang;
use App\Models\MutasiBarang;
use App\Models\RekapStokBarang;
use App\Models\RiwayatStatusBarang;
use App\Models\StockOpnameDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DataBarangController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:'.PermissionEnum::VIEW_BARANG_INVENTARIS->value)->only(['index']);
        $this->middleware('can:'.PermissionEnum::CREATE_BARANG_INVENTARIS->value)->only(['store']);
        $this->middleware('can:'.PermissionEnum::EDIT_BARANG_INVENTARIS->value)->only(['update']);
        $this->middleware('can:'.PermissionEnum::DELETE_BARANG_INVENTARIS->value)->only(['destroy']);
    }

    public function index(Request $request)
    {
        $query = Barang::query()->with([
            'modelBarang:id,nama,kategori_id,merek_id,jenis_id',
            'modelBarang.kategori:id,nama',
            'modelBarang.merek:id,nama',
            'modelBarang.jenis:id,nama',
            'asal:id,nama',
            'lokasi:id,nama,is_gudang',
            'subLokasi:id,nama,lokasi_id',
            'rak:id,nama_rak,kode_rak,lokasi_id',
        ]);

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($query) use ($search) {
                $query->whereRaw('LOWER(serial_number) LIKE ?', ['%'.strtolower($search).'%'])
                    ->orWhereHas('modelBarang', fn ($model) => $model->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']))
                    ->orWhereHas('modelBarang.merek', fn ($merek) => $merek->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']))
                    ->orWhereHas('lokasi', fn ($lokasi) => $lokasi->whereRaw('LOWER(nama) LIKE ?', ['%'.strtolower($search).'%']));
            });
        }

        if ($request->filled('kategori')) {
            $query->whereHas('modelBarang.kategori', fn ($kategori) => $kategori->where('nama', $request->string('kategori')));
        }
        if ($request->filled('lokasi')) {
            $query->whereHas('lokasi', fn ($lokasi) => $lokasi->where('nama', $request->string('lokasi')));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('kondisi')) {
            $query->where('kondisi_awal', $request->string('kondisi'));
        }

        return Inertia::render('master/barang/index', [
            'barangList' => $query->latest('id')->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'filterOptions' => [
                'kategoriList' => DB::table('kategori_barang')->orderBy('nama')->pluck('nama'),
                'lokasiList' => DB::table('lokasi')->orderBy('nama')->pluck('nama'),
                'statusList' => DB::table('barang')->whereNotNull('status')->distinct()->orderBy('status')->pluck('status'),
                'kondisiList' => ['baru', 'second'],
                'modelList' => ModelBarang::with(['merek:id,nama', 'kategori:id,nama', 'jenis:id,nama'])
                    ->whereNotNull('jenis_id')
                    ->select('id', 'nama', 'merek_id', 'kategori_id', 'jenis_id')
                    ->orderBy('nama')
                    ->get(),
                'asalList' => MasterDataHelper::getAsalList(),
                'gudangList' => MasterDataHelper::getLokasiGudang(),
                'rakList' => MasterDataHelper::getRakList(),
                'subLokasiList' => DB::table('sub_lokasi')->select('id', 'lokasi_id', 'nama')->orderBy('nama')->get(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'model_id' => ['required', 'integer', 'exists:model_barang,id'],
            'asal_id' => ['nullable', 'integer', 'exists:asal_barang,id'],
            'lokasi_id' => ['required', 'integer', Rule::exists('lokasi', 'id')->where('is_gudang', true)],
            'rak_id' => [
                'nullable',
                'integer',
                Rule::exists('rak_barang', 'id')->where(fn ($query) => $query->where('lokasi_id', $request->input('lokasi_id'))),
            ],
            'serial_number' => ['required', 'string', 'max:255', 'unique:barang,serial_number'],
            'kondisi_awal' => ['required', Rule::in(['baru', 'second'])],
            'pic' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ]);

        $model = ModelBarang::findOrFail($validated['model_id']);
        if (! $model->jenis_id) {
            throw ValidationException::withMessages(['model_id' => 'Model ini belum memiliki jenis barang.']);
        }

        DB::transaction(function () use ($validated, $model) {
            $barangMasuk = BarangMasuk::create([
                'tanggal' => $validated['tanggal'],
                'asal_barang_id' => $validated['asal_id'] ?? null,
                'user_id' => auth()->id(),
            ]);

            $barang = Barang::create([
                'model_id' => $model->id,
                'jenis_barang_id' => $model->jenis_id,
                'asal_id' => $validated['asal_id'] ?? null,
                'lokasi_id' => $validated['lokasi_id'],
                'rak_id' => $validated['rak_id'] ?? null,
                'serial_number' => $validated['serial_number'],
                'kondisi_awal' => $validated['kondisi_awal'],
                'status' => 'baik',
                'pic' => $validated['pic'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
            ]);

            BarangMasukDetail::create(['barang_masuk_id' => $barangMasuk->id, 'barang_id' => $barang->id]);
            MutasiBarang::create([
                'barang_id' => $barang->id,
                'user_id' => auth()->id(),
                'lokasi_asal_id' => null,
                'lokasi_tujuan_id' => $validated['lokasi_id'],
                'tanggal' => $validated['tanggal'],
                'keterangan' => 'Barang masuk melalui Master Data',
            ]);
            StockHelpers::barangMasuk($model->id, $validated['lokasi_id']);
        });

        return redirect()->route('barang.index')->with('message', 'Data barang berhasil ditambahkan.');
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'serial_number' => ['required', 'string', 'max:255', Rule::unique('barang', 'serial_number')->ignore($barang->id)],
            'kondisi_awal' => ['required', Rule::in(['baru', 'second'])],
            'rak_id' => [
                'nullable',
                'integer',
                Rule::exists('rak_barang', 'id')->where(fn ($query) => $query->where('lokasi_id', $barang->lokasi_id)),
            ],
            'sub_lokasi_id' => [
                'nullable',
                'integer',
                Rule::exists('sub_lokasi', 'id')->where(fn ($query) => $query->where('lokasi_id', $barang->lokasi_id)),
            ],
            'pic' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'model_id' => ['prohibited'],
            'lokasi_id' => ['prohibited'],
            'asal_id' => ['prohibited'],
            'status' => ['prohibited'],
        ]);

        $barang->update($validated);

        return redirect()->route('barang.index')->with('message', 'Data barang berhasil diperbarui.');
    }

    public function destroy(Barang $barang)
    {
        try {
            DB::transaction(function () use ($barang) {
                $barang = Barang::lockForUpdate()->findOrFail($barang->id);
                if ($reason = $this->deletionBlockReason($barang)) {
                    throw ValidationException::withMessages(['barang' => $reason]);
                }

                $detail = BarangMasukDetail::where('barang_id', $barang->id)->firstOrFail();
                $barangMasukId = $detail->barang_masuk_id;
                $rekap = RekapStokBarang::where('model_id', $barang->model_id)
                    ->where('lokasi_id', $barang->lokasi_id)
                    ->lockForUpdate()
                    ->first();

                if ($rekap) {
                    $rekap->jumlah_total = max(0, $rekap->jumlah_total - 1);
                    $rekap->jumlah_tersedia = max(0, $rekap->jumlah_tersedia - 1);
                    $rekap->save();
                }

                $detail->delete();
                MutasiBarang::where('barang_id', $barang->id)->delete();
                $barang->delete();

                if (! BarangMasukDetail::where('barang_masuk_id', $barangMasukId)->exists()) {
                    BarangMasuk::whereKey($barangMasukId)->delete();
                }
            });
        } catch (ValidationException $exception) {
            return back()->with('error', $exception->errors()['barang'][0]);
        }

        return redirect()->route('barang.index')->with('message', 'Data barang berhasil dihapus dan stok telah disesuaikan.');
    }

    private function deletionBlockReason(Barang $barang): ?string
    {
        if ($barang->status !== 'baik') {
            return 'Barang hanya dapat dihapus saat masih berstatus baik.';
        }

        if (BarangMasukDetail::where('barang_id', $barang->id)->count() !== 1) {
            return 'Catatan barang masuk tidak lengkap sehingga barang tidak aman untuk dihapus.';
        }

        $mutasi = MutasiBarang::where('barang_id', $barang->id)->get();
        if ($mutasi->count() !== 1 || $mutasi->first()->lokasi_asal_id !== null) {
            return 'Barang sudah memiliki riwayat perpindahan.';
        }

        if (
            BarangKeluarDetail::where('barang_id', $barang->id)->exists()
            || BarangKembaliDetail::where('barang_id', $barang->id)->exists()
            || RiwayatStatusBarang::where('barang_id', $barang->id)->exists()
            || DB::table('barang_pemusnahan')->where('barang_id', $barang->id)->exists()
            || StockOpnameDetail::whereJsonContains('serial_hilang', $barang->serial_number)->exists()
            || StockOpnameDetail::whereJsonContains('serial_baru', $barang->serial_number)->exists()
        ) {
            return 'Barang sudah tercatat dalam aktivitas inventaris dan tidak dapat dihapus.';
        }

        return null;
    }
}
