<?php

namespace App\Http\Controllers\Transaksi;

use App\Helpers\MasterDataHelper;
use App\Helpers\StockHelpers;
use App\Http\Controllers\Controller;
use App\Models\AsalBarang;
use App\Models\Barang;
use App\Models\BarangMasuk;
use App\Models\BarangMasukDetail;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\MutasiBarang;
use App\Models\RakBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BarangMasukController extends Controller
{
    public function index(Request $request)
    {

        $query = BarangMasuk::with([
            'asal',
            'details.barang.modelBarang.kategori',
            'details.barang.modelBarang.merek'
        ]);

        // Filter tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        // Filter kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('details.barang.modelBarang.kategori', function ($q) use ($request) {
                $q->where('id', $request->kategori_id);
            });
        }

        // Filter asal barang
        if ($request->filled('asal_barang_id')) {
            $query->where('asal_barang_id', $request->asal_barang_id);
        }

        // Filter merek
        if ($request->filled('merek')) {
            $query->whereHas('details.barang.modelBarang.merek', function ($q) use ($request) {
                $q->whereRaw('LOWER(nama) LIKE ?', ['%' . strtolower($request->merek) . '%']);
            });
        }

        // Pencarian umum
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->whereHas('details.barang', function ($q) use ($search) {
                $q->whereRaw('LOWER(serial_number) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('modelBarang', function ($q2) use ($search) {
                        $q2->whereRaw('LOWER(nama) LIKE ?', ["%{$search}%"])
                            ->orWhereHas('merek', function ($q3) use ($search) {
                                $q3->whereRaw('LOWER(nama) LIKE ?', ["%{$search}%"]);
                            });
                    });
            });
        }

        // Sorting
        $sort = $request->input('sort_by', 'desc');
        if (!in_array($sort, ['asc', 'desc'])) {
            $sort = 'desc';
        }

        // Per page (default 10, bisa all)
        $perPage = $request->input('per_page', 10);

        if ($perPage === 'all') {
            $barangMasuk = $query->orderBy('tanggal', $sort)->get();
        } else {
            $barangMasuk = $query->orderBy('tanggal', $sort)
                ->paginate((int) $perPage)
                ->withQueryString();
        }

        // Transform data
        $barangMasukData = ($perPage === 'all')
            ? $barangMasuk->map(function ($bm) {
                $detail = $bm->details->first();
                $data = [
                    'id' => $bm->id,
                    'tanggal' => $bm->tanggal,
                    'asal_barang' => $bm->asal?->nama,
                    'kategori' => $detail?->barang?->modelBarang?->kategori?->nama,
                    'merek' => $detail?->barang?->modelBarang?->merek?->nama,
                    'model' => $detail?->barang?->modelBarang?->nama,
                ];
            })
            : $barangMasuk->through(function ($bm) {
                $detail = $bm->details->first();
                return [
                    'id' => $bm->id,
                    'tanggal' => $bm->tanggal,
                    'asal_barang' => $bm->asal?->nama,
                    'kategori' => $detail?->barang?->modelBarang?->kategori?->nama,
                    'merek' => $detail?->barang?->modelBarang?->merek?->nama,
                    'model' => $detail?->barang?->modelBarang?->nama,
                ];
            });

        $data = [
            'barangMasuk' => $barangMasukData,
            'filters' => $request->only(
                'tanggal',
                'kategori_id',
                'asal_barang_id',
                'merek',
                'search',
                'sort_by',
                'per_page',
                'page'
            ),
            'kategoriOptions' => MasterDataHelper::getKategoriList(),
            'asalOptions' => MasterDataHelper::getAsalList(),
            'merekOptions' => MasterDataHelper::getMerekList(),
            'modelOptions' => MasterDataHelper::getModelList(),
            'jenisOptions' => MasterDataHelper::getJenisList(),
            'rakOptions' => MasterDataHelper::getRakList(),
        ];

        return Inertia::render('transaksi/barang-masuk/barang-masuk-index', $data);
    }

    public function getModelByKategoriMerek(Request $request)
    {
        if (!$request->filled('jenis_barang')) {
            return response()->json([]);
        }

        $models = ModelBarang::whereHas('jenis', function ($query) use ($request) {
            $query->where('nama', $request->jenis_barang);
        })->pluck('nama');

        return response()->json($models);
    }

    public function getJenisBarang(Request $request)
    {
        if (!$request->filled('kategori')) {
            return response()->json([]);
        }

        $jenisBarang = JenisBarang::whereHas('kategori', function ($query) use ($request) {
            $query->where('nama', $request->kategori);
        })->pluck('nama');

        return response()->json($jenisBarang);
    }


    public function getJenisByKategori(Request $request)
    {
        $kategori = $request->input('kategori');

        $kategoriModel = KategoriBarang::where('nama', $kategori)->first();

        if (!$kategoriModel) {
            return response()->json([]);
        }

        $jenisList = JenisBarang::where('kategori_id', $kategoriModel->id)->pluck('nama');

        return response()->json($jenisList);
    }

    public function create()
    {
        return Inertia::render('transaksi/barang-masuk/barang-masuk-create', [
            'kategoriList' => MasterDataHelper::getKategoriList(),
            'asalList' => MasterDataHelper::getAsalList(),
            'merekList' => MasterDataHelper::getMerekList(),
            'modelList' => MasterDataHelper::getModelList(),
            'jenisList' => MasterDataHelper::getJenisList(),
            'rakList' => MasterDataHelper::getRakList(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'asal_barang'   => 'nullable|string|max:100',
            'items' =>  'required|array|min:1',
            'items.*.kategori' => 'required|string|max:100',
            'items.*.merek' => 'required|string|max:100',
            'items.*.model' => 'required|string|max:100',
            'items.*.jenis_barang' => 'required|string|max:100',
            'items.*.rak_id' => 'nullable|integer|exists:rak_barang,id',
            'items.*.kondisi' => 'required|string|in:baru,second',
            'items.*.serial_numbers' => 'required|array|min:1',
            'items.*.serial_numbers.*' => 'required|string|distinct|unique:barang,serial_number',
        ]);

        DB::transaction(function () use ($request) {
            $asal = null;
            if ($request->filled('asal_barang')) {
                $asal = AsalBarang::firstOrCreate(['nama' => $request->asal_barang]);
            }

            $barangMasuk = BarangMasuk::create([
                'tanggal'   => $request->tanggal,
                'asal_barang_id'    => $asal?->id,
                'user_id'   => auth()->id(),
            ]);


            $lokasiGudang = Lokasi::where('is_gudang', true)->firstOrFail();

            // OPTIMASI: Prepare batch inserts
            $detailsToInsert = [];
            $mutasiToInsert = [];
            $stockUpdates = [];
            $now = now();

            foreach ($request->items as $item) {
                $kategori = KategoriBarang::firstOrCreate(['nama' => $item['kategori']]);
                $merk     = MerekBarang::firstOrCreate(['nama' => $item['merek']]);
                $jenis    = JenisBarang::firstOrCreate([
                    'kategori_id' => $kategori->id,
                    'nama' => $item['jenis_barang'],
                ]);
                $model    = ModelBarang::firstOrCreate([
                    'kategori_id' => $kategori->id,
                    'merek_id'    => $merk->id,
                    'jenis_id'    => $jenis->id,
                    'nama'        => $item['model'],
                ]);

                // Track stock updates per model + lokasi
                $stockKey = "{$model->id}_{$lokasiGudang->id}";
                if (!isset($stockUpdates[$stockKey])) {
                    $stockUpdates[$stockKey] = [
                        'model_id' => $model->id,
                        'lokasi_id' => $lokasiGudang->id,
                        'jumlah' => 0,
                    ];
                }

                foreach ($item['serial_numbers'] as $serial) {
                    $barang = Barang::create([
                        'model_id' => $model->id,
                        'jenis_barang_id' => $jenis->id,
                        'rak_id' => $item['rak_id'] ?? null,
                        'asal_id' => $asal?->id,
                        'lokasi_id' => $lokasiGudang->id,
                        'serial_number' => $serial,
                        'kondisi_awal' => $item['kondisi'],
                        'status' => 'baik',
                    ]);

                    $detailsToInsert[] = [
                        'barang_masuk_id' => $barangMasuk->id,
                        'barang_id' => $barang->id,
                    ];

                    $mutasiToInsert[] = [
                        'barang_id' => $barang->id,
                        'lokasi_asal_id' => null,
                        'lokasi_tujuan_id' => $lokasiGudang->id,
                        'tanggal' => $request->tanggal,
                        'keterangan' => 'Barang masuk dari sumber ' . ($asal?->nama ?? 'manual'),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    $stockUpdates[$stockKey]['jumlah']++;
                }
            }

            // Batch insert details
            if (!empty($detailsToInsert)) {
                BarangMasukDetail::insert($detailsToInsert);
            }

            // Batch insert mutasi
            if (!empty($mutasiToInsert)) {
                MutasiBarang::insert($mutasiToInsert);
            }

            // Batch stock updates
            foreach ($stockUpdates as $update) {
                StockHelpers::barangMasuk($update['model_id'], $update['lokasi_id'], $update['jumlah']);
            }
        });
        return redirect()->route('barang-masuk.index')->with('success', 'Transaksi barang berhasil dicatat.');
    }

    public function edit(BarangMasuk $barangMasuk)
    {
        $barangMasuk->load('details.barang.modelBarang.kategori', 'details.barang.modelBarang.merek', 'details.barang.modelBarang.jenis', 'details.barang.rak', 'asal');

        // Kelompokkan detail berdasarkan model barang
        $groupedDetails = $barangMasuk->details->groupBy('barang.model_id');

        $items = [];
        foreach ($groupedDetails as $modelId => $details) {
            $firstDetail = $details->first();
            if (!$firstDetail || !$firstDetail->barang) continue;

            $modelBarang = $firstDetail->barang->modelBarang;

            $items[] = [
                'kategori' => $modelBarang->kategori->nama,
                'merek' => $modelBarang->merek->nama,
                'jenis_barang' => $modelBarang->jenis->nama,
                'model' => $modelBarang->nama,
                'rak' => $firstDetail->barang->rak?->nama,
                // Ambil semua serial number untuk grup model ini
                'serial_numbers' => $details->pluck('barang.serial_number')->all(),
            ];
        }

        return Inertia::render('transaksi/barang-masuk/barang-masuk-edit', [
            'barangMasuk' => [
                'id' => $barangMasuk->id,
                'tanggal' => $barangMasuk->tanggal,
                'asal_barang' => $barangMasuk->asal?->nama,
                'items' => $items,
            ],
            // List untuk dropdown tetap sama
            'kategoriList' => KategoriBarang::all(),
            'asalList' => AsalBarang::all(),
            'merekList' => MerekBarang::all(),
            'modelList' => ModelBarang::all(),
            'jenisList' => JenisBarang::all(),
            'rakList' => RakBarang::all(),
        ]);
    }

    public function update(Request $request, BarangMasuk $barangMasuk)
    {
        // 1. Validasi dengan struktur data baru
        $request->validate([
            'tanggal' => 'required|date',
            'asal_barang' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.kategori' => 'required|string|max:100',
            'items.*.merek' => 'required|string|max:100',
            'items.*.jenis_barang' => 'required|string|max:100',
            'items.*.model' => 'required|string|max:100',
            'items.*.rak_id' => 'nullable|integer|exists:rak_barang,id',
            'items.*.kondisi' => 'required|string|in:baru,second',
            'items.*.serial_numbers' => 'required|array|min:1',
            'items.*.serial_numbers.*' => [
                'required',
                'string',
                'distinct',
                // Pastikan serial number unik, kecuali untuk barang yang sudah ada di transaksi ini
                Rule::unique('barang', 'serial_number')->ignore($barangMasuk->details->pluck('barang_id')),
            ],
        ]);

        DB::transaction(function () use ($request, $barangMasuk) {
            $lokasiGudang = Lokasi::where('is_gudang', true)->firstOrFail();

            // 2. HAPUS SEMUA DATA LAMA YANG TERKAIT TRANSAKSI INI
            // Penting: Lakukan dalam urutan yang benar untuk menghindari constraint error
            foreach ($barangMasuk->details as $detail) {
                if ($detail->barang) {
                    // Kurangi stok dari model lama
                    StockHelpers::barangKeluar($detail->barang->model_id, $lokasiGudang->id, 1);

                    // Hapus mutasi dan barangnya
                    MutasiBarang::where('barang_id', $detail->barang_id)->delete();
                    $detail->barang->delete();
                }
            }
            // Hapus semua detail transaksi
            $barangMasuk->details()->delete();

            // 3. BUAT ULANG DATA BERDASARKAN REQUEST BARU (logika sama seperti 'store')
            $asal = $request->filled('asal_barang') ? AsalBarang::firstOrCreate(['nama' => $request->asal_barang]) : null;

            // Update header transaksi
            $barangMasuk->update([
                'tanggal' => $request->tanggal,
                'asal_barang_id' => $asal?->id,
            ]);

            // Loop untuk setiap jenis barang
            foreach ($request->items as $item) {
                $kategori = KategoriBarang::firstOrCreate(['nama' => $item['kategori']]);
                $merek = MerekBarang::firstOrCreate(['nama' => $item['merek']]);
                $jenis = JenisBarang::firstOrCreate(['kategori_id' => $kategori->id, 'nama' => $item['jenis_barang']]);
                $model = ModelBarang::firstOrCreate(['kategori_id' => $kategori->id, 'merek_id' => $merek->id, 'jenis_id' => $jenis->id, 'nama' => $item['model']]);
                $rak = !empty($item['rak']) ? RakBarang::firstOrCreate(['nama' => $item['rak']]) : null;

                // Loop untuk setiap serial number
                foreach ($item['serial_numbers'] as $serial) {
                    $barang = Barang::create([
                        'model_id' => $model->id,
                        'jenis_barang_id' => $jenis->id,
                        'rak_id' => $item['rak_id'] ?? null,
                        'asal_id' => $asal?->id,
                        'lokasi_id' => $lokasiGudang->id,
                        'serial_number' => $serial,
                        'kondisi_awal' => $item['kondisi'],
                        'status' => 'baik',
                    ]);

                    BarangMasukDetail::create([
                        'barang_masuk_id' => $barangMasuk->id,
                        'barang_id' => $barang->id,
                    ]);

                    MutasiBarang::create([
                        'barang_id' => $barang->id,
                        'lokasi_asal_id' => null,
                        'lokasi_tujuan_id' => $lokasiGudang->id,
                        'tanggal' => $request->tanggal,
                        'keterangan' => 'Barang masuk dari ' . ($asal?->nama ?? 'manual'),
                    ]);

                    // Tambah stok untuk model baru
                    StockHelpers::barangMasuk($model->id, $lokasiGudang->id, 1);
                }
            }
        });

        return redirect()->route('barang-masuk.index')->with('success', 'Data barang masuk berhasil diperbarui.');
    }

    public function show(Request $request, BarangMasuk $barang_masuk)
    {
        // 1. Eager load relasi seperti biasa
        $barang_masuk->load([
            'asal',
            'user',
            'details.barang.modelBarang.kategori',
            'details.barang.modelBarang.merek',
        ]);

        // 2. Kelompokkan detail berdasarkan model barangnya
        $groupedDetails = $barang_masuk->details->groupBy('barang.model_id');

        // 3. Transformasi data menjadi struktur yang rapi untuk frontend
        $items = $groupedDetails->map(function ($details) {
            // Ambil data master dari item pertama di grup (karena semuanya sama)
            $modelBarang = $details->first()->barang->modelBarang;

            return [
                'kategori' => $modelBarang->kategori->nama,
                'merek' => $modelBarang->merek->nama,
                'model' => $modelBarang->nama,
                'serial_numbers' => $details->pluck('barang.serial_number')->all(),
            ];
        });

        // 4. Siapkan data final yang akan dikirim
        $data = [
            'id' => $barang_masuk->id,
            'tanggal' => $barang_masuk->tanggal,
            'asal' => $barang_masuk->asal,
            'user' => $barang_masuk->user,
            'items' => $items->values()->all(), // Gunakan values() untuk reset keys array
        ];

        if ($request->wantsJson()) {
            return response()->json(['barangMasuk' => $data]);
        }

        // Kirim data yang sudah ditransformasi ke view
        return Inertia::render('transaksi/barang-masuk/barang-masuk-detail', [
            'barangMasuk' => $data
        ]);
    }

    public function destroy(BarangMasuk $barang_masuk)
    {
        DB::transaction(function () use ($barang_masuk) {
            foreach ($barang_masuk->details as $detail) {
                $barang = $detail->barang;

                if ($barang) {
                    MutasiBarang::where('barang_id', $barang->id)->delete();

                    StockHelpers::barangKeluar($barang->model_id, $barang->lokasi_id, 1);

                    $barang->delete();
                }
            }

            // 4. Hapus detail barang masuk (biasanya terhapus otomatis jika ada cascade on delete)
            $barang_masuk->details()->delete();

            // 5. Hapus data utama barang masuk
            $barang_masuk->delete();
        });

        return redirect()->route('barang-masuk.index')
            ->with('success', 'Data barang masuk dan semua item terkait berhasil dihapus.');
    }
}
