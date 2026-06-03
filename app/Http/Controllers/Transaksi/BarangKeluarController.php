<?php

namespace App\Http\Controllers\Transaksi;

use App\Helpers\MasterDataHelper;
use App\Helpers\StockHelpers;
use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\BarangKeluarDetail;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\MutasiBarang;
use App\Models\View\ViewBarangKeluar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;


class BarangKeluarController extends Controller
{
    public function index(Request $request)
    {

            $perPage = $request->input('per_page', 10);
            $sort = $request->input('sort', 'terbaru');

            $query = BarangKeluar::query()
                ->with([
                    'lokasi',
                    'details.barang.modelBarang' => function ($query) {
                        $query->with(['merek', 'kategori']);
                    }
                ])
                ->when($request->tanggal, fn($q) => $q->whereDate('tanggal', $request->tanggal))
                ->when($request->lokasi_id, fn($q) => $q->where('lokasi_id', $request->lokasi_id))
                ->when($request->kategori_id, function ($q) use ($request) {
                    $q->whereHas('details.barang.modelBarang', function ($subQuery) use ($request) {
                        $subQuery->where('kategori_id', $request->kategori_id);
                    });
                })
                ->when($request->search, function ($q) use ($request) {
                    $search = '%' . strtolower($request->search) . '%';
                    $q->where(function ($query) use ($search) {
                        $query->orWhereHas('details.barang', function ($subQuery) use ($search) {
                            $subQuery->whereRaw('LOWER(serial_number) ILIKE ?', [$search]);
                        })
                        ->orWhereHas('details.barang.modelBarang', function ($subQuery) use ($search) {
                            $subQuery->whereRaw('LOWER(nama) ILIKE ?', [$search]);
                        })
                        ->orWhereHas('details.barang.modelBarang.merek', function ($subQuery) use ($search) {
                            $subQuery->whereRaw('LOWER(nama) ILIKE ?', [$search]);
                        })
                        ->orWhereHas('details.barang.modelBarang.kategori', function ($subQuery) use ($search) {
                            $subQuery->whereRaw('LOWER(nama) ILIKE ?', [$search]);
                        });
                    });
                });

            if ($sort === 'terlama') {
                $query->orderBy('tanggal', 'asc');
            } else {
                $query->orderBy('tanggal', 'desc');
            }

            if ($perPage === 'all') {
                $total = $query->clone()->count();
                $barangKeluar = $query->paginate($total > 0 ? $total : 10)->withQueryString();
            } else {
                $barangKeluar = $query->paginate(is_numeric($perPage) ? $perPage : 10)->withQueryString();
            }

            $data = [
                // PERBAIKAN: Diubah ke array murni agar bebas dari serialization penalty
                'barangKeluar' => $barangKeluar->toArray(),
                'filters' => $request->only(['tanggal', 'kategori_id', 'lokasi_id', 'search', 'sort', 'per_page']),
                'kategoriOptions' => MasterDataHelper::getKategoriList(),
                'lokasiOptions' => MasterDataHelper::getLokasiList(),
            ];

        return Inertia::render('transaksi/barang-keluar/BarangKeluarIndex', $data);
    }

    public function getModelByKategoriMerek(Request $request)
    {
        $kategori = $request->input('kategori');
        $merek = $request->input('merek');

        $kategoriModel = KategoriBarang::where('nama', $kategori)->first();
        $merekModel = MerekBarang::where('nama', $merek)->first();

        if (!$kategoriModel || !$merekModel) {
            return response()->json([]);
        }

        $models = ModelBarang::where('kategori_id', $kategoriModel->id)
            ->where('merek_id', $merekModel->id)
            ->pluck('nama');

        return response()->json($models);
    }

    public function create()
    {
        $modelIds = DB::table('rekap_stok_barang')
            ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
            ->where('rekap_stok_barang.jumlah_tersedia', '>', 0)
            ->where('lokasi.is_gudang', true)
            ->pluck('rekap_stok_barang.model_id');

        $gudangLokasiIds = DB::table('lokasi')
            ->where('is_gudang', true)
            ->pluck('id');

        $barang = Barang::with(['jenisBarang.kategori', 'modelBarang.merek'])
            ->whereIn('model_id', $modelIds)
            ->whereIn('lokasi_id', $gudangLokasiIds)
            ->whereIn('status', ['baik', 'bagus'])
            ->get();

        $serialNumberList = $barang->filter(fn($item) => $item->modelBarang && $item->modelBarang->merek)
            ->groupBy(function ($item) {
                $merek = $item->modelBarang->merek->nama ?? '-';
                $model = $item->modelBarang->nama ?? '-';
                return $merek . '|' . $model;
            })
            ->map(fn($group) => $group->pluck('serial_number')->filter()->values());

        return Inertia::render('transaksi/barang-keluar/barang-keluar-create', [
            'kategoriList' => MasterDataHelper::getKategoriList(),
            'lokasiList' => MasterDataHelper::getLokasiNonGudang(),
            'merekList' => MasterDataHelper::getMerekWithModel(),
            'modelList' => MasterDataHelper::getModelWithRelations(),
            'serialNumberList' => $serialNumberList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'lokasi' => 'required|string|max:100',
            'pic' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            // Validasi opsional untuk master data di setiap item
            'items.*.kategori' => 'required|string',
            'items.*.merek' => 'required|string',
            'items.*.model' => 'required|string',
            // Validasi untuk detail serial number
            'items.*.keluar_info' => 'required|array|min:1',
            'items.*.keluar_info.*.serial_number' => [
                'required',
                'string',
                'distinct',
                Rule::exists('barang', 'serial_number')->where(function ($query) {
                    $gudangId = Lokasi::where('is_gudang', true)->value('id');
                    $query->whereIn('status', ['baik', 'bagus'])->where('lokasi_id', $gudangId);
                }),
            ],
            'items.*.keluar_info.*.status_keluar' => 'required|string|in:dipinjamkan,dijual,maintenance',
            'items.*.keluar_info.*.sub_lokasi' => 'nullable|string|max:100',
        ]);

        $barangKeluar = null;

        DB::transaction(function () use ($request, &$barangKeluar) {
            $lokasiTujuan = Lokasi::firstOrCreate(
                ['nama' => $request->lokasi],
                ['is_gudang' => false]
            );

            // 2. Buat satu header transaksi BarangKeluar
            $barangKeluar = BarangKeluar::create([
                'tanggal' => $request->tanggal,
                'lokasi_id' => $lokasiTujuan->id,
                'user_id' => auth()->id(),
            ]);

            $lokasiGudang = Lokasi::where('is_gudang', true)->firstOrFail();

            // OPTIMASI: Pre-fetch semua barang sekaligus untuk menghindari N+1
            $allSerialNumbers = collect($request->items)
                ->pluck('keluar_info')
                ->flatten(1)
                ->pluck('serial_number')
                ->toArray();

            $barangMap = Barang::whereIn('serial_number', $allSerialNumbers)
                ->get()
                ->keyBy('serial_number');

            // Prepare batch inserts
            $detailsToInsert = [];
            $mutasiToInsert = [];
            $stockUpdates = [];

            // 3. Looping untuk setiap JENIS BARANG (item)
            foreach ($request->items as $item) {

                // 4. Looping untuk setiap SERIAL NUMBER di dalam jenis barang tsb
                foreach ($item['keluar_info'] as $info) {
                    $serial = $info['serial_number'];
                    $status = $info['status_keluar'];

                    // Gunakan pre-fetched barang dari collection
                    $barang = $barangMap[$serial] ?? null;
                    if (!$barang) continue;

                    $lokasiAsalId = $barang->lokasi_id;

                    // Cari atau buat sub-lokasi jika diisi di baris ini
                    $subLokasiId = null;
                    if (!empty($info['sub_lokasi'])) {
                        $subLokasi = \App\Models\SubLokasi::firstOrCreate(
                            ['nama' => $info['sub_lokasi'], 'lokasi_id' => $lokasiTujuan->id]
                        );
                        $subLokasiId = $subLokasi->id;
                    }

                    // Update lokasi, sub_lokasi, pic dan status barang
                    $barang->update([
                        'lokasi_id' => $lokasiTujuan->id,
                        'sub_lokasi_id' => $subLokasiId,
                        'pic' => $request->pic,
                        'status' => $status,
                    ]);

                    // Collect detail untuk batch insert
                    $detailsToInsert[] = [
                        'barang_keluar_id' => $barangKeluar->id,
                        'barang_id' => $barang->id,
                        'status_keluar' => $status,
                    ];

                    // Collect stock updates untuk batch processing
                    $stockKey = "{$barang->model_id}_{$lokasiAsalId}";
                    if (!isset($stockUpdates[$stockKey])) {
                        $stockUpdates[$stockKey] = [
                            'model_id' => $barang->model_id,
                            'lokasi_asal_id' => $lokasiAsalId,
                            'lokasi_tujuan_id' => $lokasiTujuan->id,
                            'dijual' => 0,
                            'dipinjamkan' => 0,
                        ];
                    }

                    if ($status === 'dijual') {
                        $stockUpdates[$stockKey]['dijual']++;
                    } elseif ($status === 'dipinjamkan') {
                        $stockUpdates[$stockKey]['dipinjamkan']++;
                    }

                    // Collect mutasi untuk batch insert
                    $mutasiToInsert[] = [
                        'barang_id' => $barang->id,
                        'lokasi_asal_id' => $lokasiAsalId,
                        'lokasi_tujuan_id' => $lokasiTujuan->id,
                        'tanggal' => $request->tanggal,
                        'keterangan' => "Barang keluar ke {$lokasiTujuan->nama} (Status: {$status})",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // Batch insert details
            if (!empty($detailsToInsert)) {
                BarangKeluarDetail::insert($detailsToInsert);
            }

            // Batch insert mutasi
            if (!empty($mutasiToInsert)) {
                MutasiBarang::insert($mutasiToInsert);
            }

            // Process stock updates
            foreach ($stockUpdates as $update) {
                if ($update['dijual'] > 0) {
                    StockHelpers::catatPenjualan($update['model_id'], $update['lokasi_asal_id'], $update['dijual']);
                }
                if ($update['dipinjamkan'] > 0) {
                    StockHelpers::pindahkanStok($update['model_id'], $update['lokasi_asal_id'], $update['lokasi_tujuan_id'], $update['dipinjamkan']);
                }
            }
        });

        return redirect()
            ->route('barang-keluar.index')
            ->with('success', 'Transaksi barang keluar berhasil dicatat.');
    }

    public function edit(BarangKeluar $barangKeluar)
    {
        // 1. Eager load semua relasi yang dibutuhkan
        $barangKeluar->load('details.barang.modelBarang.kategori', 'details.barang.modelBarang.merek', 'details.barang.subLokasi', 'lokasi');

        if ($barangKeluar->details->isEmpty()) {
            return redirect()->route('barang-keluar.index')->with('error', 'Transaksi tidak memiliki detail barang.');
        }

        // 2. Kelompokkan detail berdasarkan model_id barangnya
        $groupedDetails = $barangKeluar->details->groupBy('barang.model_id');

        // 3. Transformasi data ke struktur 'items' yang baru
        $items = $groupedDetails->map(function ($details) {
            // Ambil data master dari item pertama di grup (semua sama)
            $firstDetail = $details->first();
            $modelBarang = $firstDetail->barang->modelBarang;

            // Buat array 'keluar_info' untuk setiap serial number di grup ini
            $keluarInfo = $details->map(function ($detail) {
                return [
                    'serial_number' => $detail->barang->serial_number,
                    'status_keluar' => $detail->status_keluar,
                    'sub_lokasi' => $detail->barang->subLokasi->nama ?? '',
                ];
            });

            return [
                'kategori' => $modelBarang->kategori->nama,
                'merek' => $modelBarang->merek->nama,
                'model' => $modelBarang->nama,
                'keluar_info' => $keluarInfo->values()->all(),
            ];
        });

        // 4. Siapkan data final untuk dikirim ke view
        $dataToEdit = [
            'id' => $barangKeluar->id,
            'tanggal' => $barangKeluar->tanggal,
            'lokasi' => $barangKeluar->lokasi->nama,
            'pic' => $barangKeluar->details->first()?->barang?->pic ?? '',
            'items' => $items->values()->all(), // Kirim data dalam format baru
        ];

        // Logika untuk mendapatkan daftar SN yang tersedia (bisa tetap sama)
        $gudangLokasiIds = Lokasi::where('is_gudang', true)->pluck('id');
        $availableBarang = Barang::with(['modelBarang.merek', 'modelBarang.kategori'])
            ->whereIn('lokasi_id', $gudangLokasiIds)
            ->whereIn('status', ['baik', 'bagus'])
            ->get();

        $serialNumberList = $availableBarang->groupBy(function ($item) {
            $merek = $item->modelBarang->merek->nama ?? 'Tanpa Merek';
            $model = $item->modelBarang->nama ?? 'Tanpa Model';
            return $merek . '|' . $model;
        })->map(fn($group) => $group->pluck('serial_number')->filter()->values());

        return Inertia::render('transaksi/barang-keluar/barang-keluar-edit', [
            'barangKeluar' => $dataToEdit,
            'lokasiList' => Lokasi::where('is_gudang', false)->get(['id', 'nama']),
            'serialNumberList' => $serialNumberList,
            'kategoriList' => KategoriBarang::all(),
            'merekList' => MerekBarang::with(['modelBarang.jenis'])->get(),
            'modelList' => ModelBarang::with(['merek', 'jenis.kategori'])->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'lokasi' => 'required|string|max:100',
            'pic' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.kategori' => 'required|string', 
            'items.*.merek' => 'required|string',    
            'items.*.model' => 'required|string',    
            'items.*.keluar_info' => 'required|array|min:1',
            'items.*.keluar_info.*.serial_number' => 'required|string|exists:barang,serial_number',
            'items.*.keluar_info.*.status_keluar' => 'required|string|in:dipinjamkan,dijual,maintenance',
            'items.*.keluar_info.*.sub_lokasi' => 'nullable|string|max:100',
        ]);

        $barangKeluar = BarangKeluar::with('details.barang')->findOrFail($id);
        $lokasiGudang = Lokasi::where('is_gudang', true)->first();

        DB::transaction(function () use ($request, $barangKeluar, $lokasiGudang) {
            $lokasiTujuan = Lokasi::firstOrCreate(['nama' => $request->lokasi], ['is_gudang' => false]);
            $barangKeluar->update([
                'tanggal' => $request->tanggal,
                'lokasi_id' => $lokasiTujuan->id,
            ]);

            $oldDetails = $barangKeluar->details;
            $oldSerials = $oldDetails->pluck('barang.serial_number')->all();

            $requestSerials = [];
            foreach ($request->items as $item) {
                foreach ($item['keluar_info'] as $info) {
                    $requestSerials[] = $info['serial_number'];
                }
            }

            // 1. Hapus barang yang tidak ada di request
            $removedSerials = array_diff($oldSerials, $requestSerials);
            foreach ($removedSerials as $serial) {
                $detail = $oldDetails->where('barang.serial_number', $serial)->first();
                if ($detail) {
                    $barang = $detail->barang;
                    $lokasiAsalBarangSaatKeluar = $barang->lokasi_id;

                    if ($detail->status_keluar === 'dijual') {
                        StockHelpers::batalJual($barang->model_id, $lokasiGudang->id, 1);
                    } elseif ($detail->status_keluar === 'dipinjamkan') {
                        StockHelpers::pindahkanStok($barang->model_id, $lokasiAsalBarangSaatKeluar, $lokasiGudang->id, 1);
                    }

                    $barang->update([
                        'lokasi_id' => $lokasiGudang->id,
                        'sub_lokasi_id' => null,
                        'pic' => null,
                        'status' => 'baik'
                    ]);
                    $detail->delete();
                }
            }

            // 2. Proses barang di request (update existing atau add new)
            foreach ($request->items as $item) {
                foreach ($item['keluar_info'] as $info) {
                    $serial = $info['serial_number'];
                    $status = $info['status_keluar'];

                    $barang = Barang::where('serial_number', $serial)->first();
                    if (!$barang) continue;

                    $subLokasiId = null;
                    if (!empty($info['sub_lokasi'])) {
                        $subLokasi = \App\Models\SubLokasi::firstOrCreate(
                            ['nama' => $info['sub_lokasi'], 'lokasi_id' => $lokasiTujuan->id]
                        );
                        $subLokasiId = $subLokasi->id;
                    }

                    $detail = $oldDetails->where('barang.serial_number', $serial)->first();

                    if ($detail) {
                        // Update existing detail
                        if ($detail->status_keluar !== $status) {
                            $lokasiAsalBarangSaatKeluar = $barang->lokasi_id;

                            // Revert old stock impact
                            if ($detail->status_keluar === 'dijual') {
                                StockHelpers::batalJual($barang->model_id, $lokasiGudang->id, 1);
                            } elseif ($detail->status_keluar === 'dipinjamkan') {
                                StockHelpers::pindahkanStok($barang->model_id, $lokasiAsalBarangSaatKeluar, $lokasiGudang->id, 1);
                            }

                            // Apply new stock impact
                            if ($status === 'dijual') {
                                StockHelpers::catatPenjualan($barang->model_id, $lokasiGudang->id, 1);
                            } elseif ($status === 'dipinjamkan') {
                                StockHelpers::pindahkanStok($barang->model_id, $lokasiGudang->id, $lokasiTujuan->id, 1);
                            }

                            $detail->update(['status_keluar' => $status]);
                        }
                    } else {
                        // Add new detail
                        if ($status === 'dijual') {
                            StockHelpers::catatPenjualan($barang->model_id, $lokasiGudang->id, 1);
                        } elseif ($status === 'dipinjamkan') {
                            StockHelpers::pindahkanStok($barang->model_id, $lokasiGudang->id, $lokasiTujuan->id, 1);
                        }

                        $barangKeluar->details()->create([
                            'barang_id' => $barang->id,
                            'status_keluar' => $status
                        ]);
                    }

                    // Always update current location/sub/pic/status on Barang model
                    $barang->update([
                        'lokasi_id' => $lokasiTujuan->id,
                        'sub_lokasi_id' => $subLokasiId,
                        'pic' => $request->pic,
                        'status' => $status
                    ]);
                }
            }
        });

        return redirect()->route('barang-keluar.index')->with('success', 'Transaksi barang keluar berhasil diperbarui.');
    }

    public function show(Request $request, $id)
    {
        $barangKeluar = BarangKeluar::with([
            'lokasi',
            'user',
            'details.barang.modelBarang' => function ($query) {
                $query->with(['merek', 'kategori']);
            },
            'details.barang.subLokasi',
        ])->findOrFail($id);

        // Kelompokkan detail berdasarkan model barangnya
        $groupedDetails = $barangKeluar->details->groupBy('barang.model_id');

        // Transformasi data menjadi struktur yang rapi untuk frontend
        $items = $groupedDetails->map(function ($details) {
            $modelBarang = $details->first()->barang->modelBarang;

            return [
                'kategori' => $modelBarang->kategori->nama ?? '-',
                'merek' => $modelBarang->merek->nama ?? '-',
                'model' => $modelBarang->nama ?? '-',
                'details' => $details->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'serial_number' => $detail->barang->serial_number,
                        'status_keluar' => $detail->status_keluar,
                        'sub_lokasi' => $detail->barang->subLokasi->nama ?? '-',
                        'pic' => $detail->barang->pic ?? '-',
                    ];
                })->values()->all(),
            ];
        });

        $data = [
            'id' => $barangKeluar->id,
            'tanggal' => $barangKeluar->tanggal,
            'lokasi' => $barangKeluar->lokasi,
            'user' => $barangKeluar->user,
            'items' => $items->values()->all(),
        ];

        if ($request->wantsJson()) {
            return response()->json(['barangKeluar' => $data]);
        }

        return Inertia::render('transaksi/barang-keluar/BarangKeluarDetail', [
            'barangKeluar' => $data,
        ]);
    }

    public function cetakLabel($id)
    {
        $barangKeluar = BarangKeluar::with([
            'lokasi',
            'details.barang.modelBarang.merek',
            'details.barang.modelBarang.kategori',
        ])->findOrFail($id);

        // Pastikan ada detail barang keluar
        if ($barangKeluar->details->isEmpty()) {
            abort(404, 'Transaksi ini tidak memiliki detail barang untuk dicetak.');
        }

        $labelData = $barangKeluar->details->map(function ($item) use ($barangKeluar) {
            $barang = $item->barang;
            $model = $barang->modelBarang;
            $merek = optional($model->merek)->nama ?? '-';
            $kategori = optional($model->kategori)->nama ?? '-';
            $modelName = $model->nama ?? '-';
            $sn = "SN: " . ($barang->serial_number ?? '-');

            // Uppercase semua bagian kecuali SN dan Tanggal
            $barangInfo = mb_strtoupper("$kategori : $merek $modelName", 'UTF-8');
            $lokasi = mb_strtoupper($barangKeluar->lokasi->nama ?? '-', 'UTF-8');

            // Format tanggal: hari dan tahun biasa, bulan uppercase
            $tanggalCarbon = \Carbon\Carbon::parse($barangKeluar->tanggal);
            $tanggal = $tanggalCarbon->format('d') . ' ' .
                    mb_strtoupper($tanggalCarbon->translatedFormat('F'), 'UTF-8') . ' ' .
                    $tanggalCarbon->format('Y');

            return [
                'header' => 'MILIK CV BINTANG TEKNOLOGI',
                'barang_info' => $barangInfo,
                'sn' => $sn,
                'dipinjamkan_kepada' => 'DIPINJAMKAN KEPADA',
                'lokasi' => $lokasi,
                'tanggal' => $tanggal,
                'peringatan' => '*DILARANG MEMBUKA ATAU MEREPARASI TANPA SEIZIN DARI PEMILIK*',
            ];
        });

        return Inertia::render('transaksi/barang-keluar/cetak-label', [
            'labelData' => $labelData,
        ]);
    }
    
    public function cetakLabelItem($id, $detailId)
    {
        $barangKeluar = BarangKeluar::with([
            'lokasi',
            'details.barang.modelBarang.merek',
            'details.barang.modelBarang.kategori',
        ])->findOrFail($id);

        $detail = $barangKeluar->details->firstWhere('id', $detailId);
        if (!$detail) {
            abort(404, 'Detail barang tidak ditemukan.');
        }

        $barang = $detail->barang;
        $model = $barang->modelBarang;
        $merek = optional($model->merek)->nama ?? '-';
        $kategori = optional($model->kategori)->nama ?? '-';
        $modelName = $model->nama ?? '-';
        $sn = "SN: " . ($barang->serial_number ?? '-');

        $barangInfo = mb_strtoupper("$kategori : $merek $modelName", 'UTF-8');
        $lokasi = mb_strtoupper($barangKeluar->lokasi->nama ?? '-', 'UTF-8');
        $tanggalCarbon = \Carbon\Carbon::parse($barangKeluar->tanggal);
        $tanggal = $tanggalCarbon->format('d') . ' ' .
                mb_strtoupper($tanggalCarbon->translatedFormat('F'), 'UTF-8') . ' ' .
                $tanggalCarbon->format('Y');

        $labelData = [[
            'header' => 'MILIK CV BINTANG TEKNOLOGI',
            'barang_info' => $barangInfo,
            'sn' => $sn,
            'dipinjamkan_kepada' => 'DIPINJAMKAN KEPADA',
            'lokasi' => $lokasi,
            'tanggal' => $tanggal,
            'peringatan' => '*DILARANG MEMBUKA ATAU MEREPARASI TANPA SEIZIN DARI PEMILIK*',
        ]];

        return Inertia::render('transaksi/barang-keluar/cetak-label', [
            'labelData' => $labelData,
        ]);
    }

    public function cetakSurat($id)
    {
        $barangKeluar = BarangKeluar::with([
            'lokasi',
            'details.barang.modelBarang.merek',
            'details.barang.modelBarang.kategori',
        ])->findOrFail($id);

        // 1. Kelompokkan detail berdasarkan model barangnya
        $groupedByModel = $barangKeluar->details->groupBy('barang.model_id');

        // 2. Transformasi setiap grup menjadi satu baris data barang untuk surat
        $barangList = $groupedByModel->map(function (Collection $group) {
            $firstDetail = $group->first();
            $modelBarang = $firstDetail->barang->modelBarang;
            $merek = $modelBarang->merek->nama ?? 'N/A';
            $model = $modelBarang->nama ?? 'N/A';
            $kategori = $modelBarang->kategori->nama ?? 'N/A';

            // Gabungkan semua serial number untuk model ini
            $serialNumbers = $group->pluck('barang.serial_number')->implode(', ');

            return [
                'nama' => strtoupper($kategori), // Gunakan Kategori sebagai Nama
                'merek_type' => strtoupper("{$merek} / {$model} (" . $group->count() . " UNIT)"),
                'serial_number' => $serialNumbers,
                'kelengkapan' => 'ADAPTOR, SOFTWARE, DRIVER, TUTORIAL PRINTER',
            ];
        })->values()->all();

        // Format tanggal surat
        $tanggal = Carbon::parse($barangKeluar->tanggal);
        $bulan = $tanggal->format('m');
        $tahun = $tanggal->format('Y');
        $bulanRomawi = $this->convertToRoman($bulan);

        // Hitung jumlah surat di bulan-tahun yang sama
        $jumlahSuratBulanIni = BarangKeluar::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->where('tanggal', '<=', $tanggal)
            ->count();

        // Buat nomor urut 3 digit
        $nomorUrut = str_pad($jumlahSuratBulanIni, 3, '0', STR_PAD_LEFT);

        // Format nomor surat
        $nomorSurat = "{$nomorUrut}/SKKP/BINTEK/{$bulanRomawi}/{$tahun}";

        // Susun data untuk dikirim ke Inertia
        $data = [
            'nomor' => $nomorSurat,
            'tanggal_pinjam' => $barangKeluar->tanggal,
            'peminjam' => [
                'nama_lokasi' => strtoupper($barangKeluar->lokasi->nama),
                'alamat_lokasi' => strtoupper($barangKeluar->lokasi->alamat),
                'penempatan' => strtoupper($barangKeluar->lokasi->nama),
            ],
            'barang' => $barangList,
        ];

        return Inertia::render('transaksi/barang-keluar/surat-pinjaman', [
            'data' => $data,
        ]);
    }

    public function destroy(BarangKeluar $barangKeluar)
    {
        DB::transaction(function () use ($barangKeluar) {
            $lokasiGudang = Lokasi::where('is_gudang', true)->firstOrFail();

            foreach ($barangKeluar->details as $detail) {
                $barang = $detail->barang;

                if ($barang) {
                    // Reverse stok berdasarkan status keluar
                    if ($detail->status_keluar === 'dijual') {
                        StockHelpers::batalJual($barang->model_id, $lokasiGudang->id, 1);
                    } elseif ($detail->status_keluar === 'dipinjamkan') {
                        StockHelpers::pindahkanStok($barang->model_id, $barang->lokasi_id, $lokasiGudang->id, 1);
                    }

                    // Hapus mutasi terkait
                    MutasiBarang::where('barang_id', $barang->id)->delete();

                    // Kembalikan status dan lokasi barang ke gudang
                    $barang->update([
                        'lokasi_id' => $lokasiGudang->id,
                        'status' => 'baik',
                        'sub_lokasi_id' => null,
                        'pic' => null,
                    ]);
                }
            }

            // Hapus semua detail
            $barangKeluar->details()->delete();

            // Hapus data utama
            $barangKeluar->delete();
        });

        return redirect()->route('barang-keluar.index')
            ->with('success', 'Data barang keluar dan semua item terkait berhasil dihapus.');
    }

    private function convertToRoman($month)
    {
        $romans = [
            '01' => 'I', '02' => 'II', '03' => 'III', '04' => 'IV',
            '05' => 'V', '06' => 'VI', '07' => 'VII', '08' => 'VIII',
            '09' => 'IX', '10' => 'X', '11' => 'XI', '12' => 'XII',
        ];

        return $romans[$month] ?? '';
    }

}
