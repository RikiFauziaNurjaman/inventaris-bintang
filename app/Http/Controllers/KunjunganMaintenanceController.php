<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KunjunganMaintenance;
use App\Models\KunjunganMaintenanceDetail;
use App\Models\Lokasi;
use App\Models\SubLokasi;
use App\Models\User;
use App\Helpers\MaintenanceNotificationHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KunjunganMaintenanceController extends Controller
{
    /**
     * Halaman index: Menampilkan riwayat kunjungan & monitoring jadwal 3/6 bulan
     */
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'riwayat'); // 'riwayat' atau 'jadwal'
        $perPage = (int) $request->input('per_page', 10);

        // 1. Query Riwayat Kunjungan
        $query = KunjunganMaintenance::with([
            'lokasi:id,nama,alamat',
            'user:id,name',
            'details.barang.modelBarang.merek:id,nama',
            'details.barang.modelBarang:id,nama,merek_id,kategori_id',
            'details.subLokasi:id,nama,lantai',
        ]);

        if ($request->filled('lokasi_id')) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('tanggal_mulai')) {
            $query->whereDate('tanggal_kunjungan', '>=', $request->tanggal_mulai);
        }

        if ($request->filled('tanggal_akhir')) {
            $query->whereDate('tanggal_kunjungan', '<=', $request->tanggal_akhir);
        }

        if ($request->filled('search')) {
            $search = strtolower(trim($request->search));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nomor_kunjungan) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(nama_teknisi) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(pic_lokasi) LIKE ?', ["%{$search}%"])
                    ->orWhereHas('lokasi', fn ($loc) => $loc->whereRaw('LOWER(nama) LIKE ?', ["%{$search}%"]))
                    ->orWhereHas('details.barang', fn ($b) => $b->whereRaw('LOWER(serial_number) LIKE ?', ["%{$search}%"]));
            });
        }

        $kunjunganPaginated = $query->orderByDesc('tanggal_kunjungan')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        // 2. Monitoring Jadwal Kunjungan Berkala per Lokasi Pelanggan
        $lokasiPelanggan = Lokasi::where('is_gudang', false)
            ->whereHas('barang')
            ->withCount(['barang as total_printer' => function ($q) {
                $q->where('status', 'dipinjamkan');
            }])
            ->with([
                'kunjunganMaintenance' => function ($q) {
                    $q->orderByDesc('tanggal_kunjungan')->orderByDesc('id');
                }
            ])
            ->get();

        $today = Carbon::today();

        $jadwalMonitoring = $lokasiPelanggan->map(function ($lokasi) use ($today) {
            $lastKunjungan = $lokasi->kunjunganMaintenance->first();

            $tanggalTerakhir = $lastKunjungan?->tanggal_kunjungan;
            $jadwalBerikutnya = $lastKunjungan?->jadwal_berikutnya;
            $periodeBulan = $lastKunjungan?->periode_bulan ?? 3;

            // Jika belum pernah dikunjungi, estimasi jadwal berdasarkan barang keluar pertama atau 3 bulan ke depan
            if (!$jadwalBerikutnya) {
                $firstBarang = Barang::where('lokasi_id', $lokasi->id)->orderBy('created_at')->first();
                $tanggalAwal = $firstBarang ? Carbon::parse($firstBarang->created_at) : $today;
                $jadwalBerikutnya = $tanggalAwal->copy()->addMonths($periodeBulan);
                $statusJatuhTempo = 'never_visited';
            } else {
                $jadwalDate = Carbon::parse($jadwalBerikutnya);
                $diffDays = $today->diffInDays($jadwalDate, false); // Positif jika masa depan, negatif jika lewat

                if ($diffDays < 0) {
                    $statusJatuhTempo = 'overdue'; // 🔴 Sudah lewat jatuh tempo
                } elseif ($diffDays <= 30) {
                    $statusJatuhTempo = 'due_soon'; // 🟡 Jatuh tempo dalam <= 30 hari
                } else {
                    $statusJatuhTempo = 'up_to_date'; // 🟢 Masih aman / terjadwal
                }
            }

            $diffInDays = $jadwalBerikutnya ? $today->diffInDays(Carbon::parse($jadwalBerikutnya), false) : 0;

            return [
                'lokasi_id' => $lokasi->id,
                'lokasi_nama' => $lokasi->nama,
                'lokasi_alamat' => $lokasi->alamat,
                'total_printer' => $lokasi->total_printer,
                'kunjungan_terakhir' => $tanggalTerakhir ? Carbon::parse($tanggalTerakhir)->format('Y-m-d') : null,
                'nomor_kunjungan_terakhir' => $lastKunjungan?->nomor_kunjungan,
                'teknisi_terakhir' => $lastKunjungan?->nama_teknisi,
                'periode_bulan' => $periodeBulan,
                'jadwal_berikutnya' => $jadwalBerikutnya ? Carbon::parse($jadwalBerikutnya)->format('Y-m-d') : null,
                'status_jatuh_tempo' => $statusJatuhTempo,
                'diff_in_days' => $diffInDays,
            ];
        })->sortBy('diff_in_days')->values();

        // 3. Ringkasan Statistik
        $stats = [
            'total_kunjungan' => KunjunganMaintenance::where('status', 'selesai')->count(),
            'total_lokasi' => $jadwalMonitoring->count(),
            'overdue' => $jadwalMonitoring->where('status_jatuh_tempo', 'overdue')->count(),
            'due_soon' => $jadwalMonitoring->where('status_jatuh_tempo', 'due_soon')->count(),
            'up_to_date' => $jadwalMonitoring->where('status_jatuh_tempo', 'up_to_date')->count(),
            'never_visited' => $jadwalMonitoring->where('status_jatuh_tempo', 'never_visited')->count(),
        ];

        // 4. Filter Options
        $lokasiOptions = Lokasi::where('is_gudang', false)
            ->whereHas('barang')
            ->select('id', 'nama')
            ->orderBy('nama')
            ->get();

        return Inertia::render('maintenance/index', [
            'kunjunganPaginated' => $kunjunganPaginated,
            'jadwalMonitoring' => $jadwalMonitoring,
            'stats' => $stats,
            'filters' => $request->only(['lokasi_id', 'status', 'tanggal_mulai', 'tanggal_akhir', 'search', 'tab', 'per_page']),
            'activeTab' => $activeTab,
            'lokasiOptions' => $lokasiOptions,
        ]);
    }

    /**
     * API get daftar printer yang ada di lokasi tertentu (untuk dropdown form)
     */
    public function getPrintersByLokasi($lokasiId)
    {
        $printers = Barang::with([
            'modelBarang.merek:id,nama',
            'modelBarang.kategori:id,nama',
            'subLokasi:id,nama,lantai',
            'kunjunganDetails' => function ($q) {
                $q->latest()->limit(1);
            }
        ])
            ->where('lokasi_id', $lokasiId)
            ->where('status', 'dipinjamkan')
            ->orderBy('sub_lokasi_id')
            ->orderBy('serial_number')
            ->get()
            ->map(function ($b) {
                $lastDetail = $b->kunjunganDetails->first();
                return [
                    'barang_id' => $b->id,
                    'serial_number' => $b->serial_number,
                    'model_nama' => $b->modelBarang?->nama ?? '-',
                    'merek_nama' => $b->modelBarang?->merek?->nama ?? '-',
                    'kategori_nama' => $b->modelBarang?->kategori?->nama ?? 'Printer',
                    'sub_lokasi_id' => $b->sub_lokasi_id,
                    'sub_lokasi_nama' => $b->subLokasi ? $b->subLokasi->nama . ($b->subLokasi->lantai ? " (Lt. {$b->subLokasi->lantai})" : '') : 'Lokasi Utama',
                    'pic' => $b->pic ?? '-',
                    'kondisi_sebelumnya' => $b->status ?? 'baik',
                    'counter_terakhir' => $lastDetail?->counter_cetak ?? 0,
                    // Default values for form
                    'kondisi_fisik' => 'baik',
                    'status_operasional' => 'normal',
                    'counter_cetak' => $lastDetail?->counter_cetak ?? null,
                    'kondisi_print_head' => 'bagus',
                    'kondisi_tinta_ribbon' => 'cukup',
                    'kondisi_roller_mekanikal' => 'normal',
                    'tindakan' => 'Pembersihan & Pengecekan Rutin',
                    'catatan' => '',
                    'sync_status_barang' => false,
                ];
            });

        return response()->json($printers);
    }

    /**
     * Halaman form tambah kunjungan baru
     */
    public function create(Request $request)
    {
        $lokasiList = Lokasi::where('is_gudang', false)
            ->whereHas('barang')
            ->withCount(['barang as total_printer' => function ($q) {
                $q->where('status', 'dipinjamkan');
            }])
            ->select('id', 'nama', 'alamat')
            ->orderBy('nama')
            ->get();

        $selectedLokasiId = $request->input('lokasi_id');
        $printers = [];

        if ($selectedLokasiId) {
            $printers = $this->getPrintersByLokasi($selectedLokasiId)->getData(true);
        }

        $defaultTeknisi = auth()->user()?->name ?? '';

        return Inertia::render('maintenance/create', [
            'lokasiList' => $lokasiList,
            'selectedLokasiId' => $selectedLokasiId ? (int) $selectedLokasiId : null,
            'initialPrinters' => $printers,
            'defaultTeknisi' => $defaultTeknisi,
            'nomorKunjunganAuto' => KunjunganMaintenance::generateNomorKunjungan(),
        ]);
    }

    /**
     * Simpan data kunjungan maintenance
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'nama_teknisi' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'periode_bulan' => 'required|integer|in:1,2,3,4,5,6,12',
            'jadwal_berikutnya' => 'nullable|date',
            'status' => 'required|string|in:terjadwal,selesai,dibatalkan',
            'pic_lokasi' => 'nullable|string|max:255',
            'kontak_pic' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.sub_lokasi_id' => 'nullable|exists:sub_lokasi,id',
            'items.*.kondisi_sebelumnya' => 'nullable|string',
            'items.*.kondisi_fisik' => 'required|string|in:baik,perlu_perbaikan,rusak',
            'items.*.status_operasional' => 'required|string|in:normal,gangguan_ringan,rusak_total',
            'items.*.counter_cetak' => 'nullable|integer|min:0',
            'items.*.kondisi_print_head' => 'nullable|string',
            'items.*.kondisi_tinta_ribbon' => 'nullable|string',
            'items.*.kondisi_roller_mekanikal' => 'nullable|string',
            'items.*.tindakan' => 'nullable|string',
            'items.*.catatan' => 'nullable|string',
            'items.*.sync_status_barang' => 'nullable|boolean',
        ]);

        $kunjungan = null;

        DB::transaction(function () use ($validated, $request, &$kunjungan) {
            $nomorKunjungan = KunjunganMaintenance::generateNomorKunjungan();

            // Hitung jadwal berikutnya jika tidak diisi manual
            $jadwalBerikutnya = $validated['jadwal_berikutnya'] ?? null;
            if (!$jadwalBerikutnya) {
                $jadwalBerikutnya = Carbon::parse($validated['tanggal_kunjungan'])
                    ->addMonths((int) $validated['periode_bulan'])
                    ->format('Y-m-d');
            }

            $kunjungan = KunjunganMaintenance::create([
                'nomor_kunjungan' => $nomorKunjungan,
                'lokasi_id' => $validated['lokasi_id'],
                'user_id' => auth()->id(),
                'nama_teknisi' => $validated['nama_teknisi'],
                'tanggal_kunjungan' => $validated['tanggal_kunjungan'],
                'periode_bulan' => $validated['periode_bulan'],
                'jadwal_berikutnya' => $jadwalBerikutnya,
                'status' => $validated['status'],
                'pic_lokasi' => $validated['pic_lokasi'] ?? null,
                'kontak_pic' => $validated['kontak_pic'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                KunjunganMaintenanceDetail::create([
                    'kunjungan_id' => $kunjungan->id,
                    'barang_id' => $item['barang_id'],
                    'sub_lokasi_id' => $item['sub_lokasi_id'] ?? null,
                    'kondisi_sebelumnya' => $item['kondisi_sebelumnya'] ?? 'baik',
                    'kondisi_fisik' => $item['kondisi_fisik'],
                    'status_operasional' => $item['status_operasional'],
                    'counter_cetak' => !empty($item['counter_cetak']) ? (int) $item['counter_cetak'] : null,
                    'kondisi_print_head' => $item['kondisi_print_head'] ?? null,
                    'kondisi_tinta_ribbon' => $item['kondisi_tinta_ribbon'] ?? null,
                    'kondisi_roller_mekanikal' => $item['kondisi_roller_mekanikal'] ?? null,
                    'tindakan' => $item['tindakan'] ?? null,
                    'catatan' => $item['catatan'] ?? null,
                    'sync_status_barang' => !empty($item['sync_status_barang']),
                ]);

                // Update status barang jika diminta sync
                if (!empty($item['sync_status_barang'])) {
                    $statusBarangBaru = match ($item['kondisi_fisik']) {
                        'rusak' => 'rusak',
                        'perlu_perbaikan' => 'diperbaiki',
                        default => 'dipinjamkan',
                    };

                    Barang::where('id', $item['barang_id'])->update([
                        'status' => $statusBarangBaru,
                    ]);
                }
            }
        });

        MaintenanceNotificationHelper::clearCache();

        return redirect()->route('kunjungan-maintenance.index')
            ->with('success', "Kunjungan maintenance {$kunjungan->nomor_kunjungan} berhasil dicatat!");
    }

    /**
     * Tampilkan detail kunjungan (JSON untuk modal atau API)
     */
    public function show(KunjunganMaintenance $kunjunganMaintenance)
    {
        $kunjunganMaintenance->load([
            'lokasi:id,nama,alamat',
            'user:id,name',
            'details.barang.modelBarang.merek:id,nama',
            'details.barang.modelBarang:id,nama,merek_id,kategori_id',
            'details.subLokasi:id,nama,lantai',
        ]);

        return response()->json($kunjunganMaintenance);
    }

    /**
     * Halaman edit kunjungan maintenance
     */
    public function edit(KunjunganMaintenance $kunjunganMaintenance)
    {
        $kunjunganMaintenance->load([
            'lokasi:id,nama,alamat',
            'details.barang.modelBarang.merek:id,nama',
            'details.barang.modelBarang:id,nama,merek_id,kategori_id',
            'details.subLokasi:id,nama,lantai',
        ]);

        $lokasiList = Lokasi::where('is_gudang', false)
            ->whereHas('barang')
            ->select('id', 'nama', 'alamat')
            ->orderBy('nama')
            ->get();

        return Inertia::render('maintenance/edit', [
            'kunjungan' => $kunjunganMaintenance,
            'lokasiList' => $lokasiList,
        ]);
    }

    /**
     * Update data kunjungan maintenance
     */
    public function update(Request $request, KunjunganMaintenance $kunjunganMaintenance)
    {
        $validated = $request->validate([
            'nama_teknisi' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'periode_bulan' => 'required|integer|in:1,2,3,4,5,6,12',
            'jadwal_berikutnya' => 'nullable|date',
            'status' => 'required|string|in:terjadwal,selesai,dibatalkan',
            'pic_lokasi' => 'nullable|string|max:255',
            'kontak_pic' => 'nullable|string|max:100',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|integer',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.sub_lokasi_id' => 'nullable|exists:sub_lokasi,id',
            'items.*.kondisi_sebelumnya' => 'nullable|string',
            'items.*.kondisi_fisik' => 'required|string|in:baik,perlu_perbaikan,rusak',
            'items.*.status_operasional' => 'required|string|in:normal,gangguan_ringan,rusak_total',
            'items.*.counter_cetak' => 'nullable|integer|min:0',
            'items.*.kondisi_print_head' => 'nullable|string',
            'items.*.kondisi_tinta_ribbon' => 'nullable|string',
            'items.*.kondisi_roller_mekanikal' => 'nullable|string',
            'items.*.tindakan' => 'nullable|string',
            'items.*.catatan' => 'nullable|string',
            'items.*.sync_status_barang' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $kunjunganMaintenance) {
            $jadwalBerikutnya = $validated['jadwal_berikutnya'] ?? null;
            if (!$jadwalBerikutnya) {
                $jadwalBerikutnya = Carbon::parse($validated['tanggal_kunjungan'])
                    ->addMonths((int) $validated['periode_bulan'])
                    ->format('Y-m-d');
            }

            $kunjunganMaintenance->update([
                'nama_teknisi' => $validated['nama_teknisi'],
                'tanggal_kunjungan' => $validated['tanggal_kunjungan'],
                'periode_bulan' => $validated['periode_bulan'],
                'jadwal_berikutnya' => $jadwalBerikutnya,
                'status' => $validated['status'],
                'pic_lokasi' => $validated['pic_lokasi'] ?? null,
                'kontak_pic' => $validated['kontak_pic'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
            ]);

            // Update details
            foreach ($validated['items'] as $item) {
                KunjunganMaintenanceDetail::updateOrCreate(
                    [
                        'kunjungan_id' => $kunjunganMaintenance->id,
                        'barang_id' => $item['barang_id'],
                    ],
                    [
                        'sub_lokasi_id' => $item['sub_lokasi_id'] ?? null,
                        'kondisi_sebelumnya' => $item['kondisi_sebelumnya'] ?? 'baik',
                        'kondisi_fisik' => $item['kondisi_fisik'],
                        'status_operasional' => $item['status_operasional'],
                        'counter_cetak' => !empty($item['counter_cetak']) ? (int) $item['counter_cetak'] : null,
                        'kondisi_print_head' => $item['kondisi_print_head'] ?? null,
                        'kondisi_tinta_ribbon' => $item['kondisi_tinta_ribbon'] ?? null,
                        'kondisi_roller_mekanikal' => $item['kondisi_roller_mekanikal'] ?? null,
                        'tindakan' => $item['tindakan'] ?? null,
                        'catatan' => $item['catatan'] ?? null,
                        'sync_status_barang' => !empty($item['sync_status_barang']),
                    ]
                );

                if (!empty($item['sync_status_barang'])) {
                    $statusBarangBaru = match ($item['kondisi_fisik']) {
                        'rusak' => 'rusak',
                        'perlu_perbaikan' => 'diperbaiki',
                        default => 'dipinjamkan',
                    };

                    Barang::where('id', $item['barang_id'])->update([
                        'status' => $statusBarangBaru,
                    ]);
                }
            }
        });

        MaintenanceNotificationHelper::clearCache();

        return redirect()->route('kunjungan-maintenance.index')
            ->with('success', "Kunjungan maintenance {$kunjunganMaintenance->nomor_kunjungan} berhasil diperbarui!");
    }

    /**
     * Hapus data kunjungan maintenance
     */
    public function destroy(KunjunganMaintenance $kunjunganMaintenance)
    {
        $nomor = $kunjunganMaintenance->nomor_kunjungan;
        $kunjunganMaintenance->delete();

        MaintenanceNotificationHelper::clearCache();

        return redirect()->route('kunjungan-maintenance.index')
            ->with('success', "Kunjungan maintenance {$nomor} berhasil dihapus!");
    }

    /**
     * Cetak Berita Acara Kunjungan / Form Maintenance (PDF)
     */
    public function exportPdf(KunjunganMaintenance $kunjunganMaintenance)
    {
        $kunjunganMaintenance->load([
            'lokasi',
            'user',
            'details.barang.modelBarang.merek',
            'details.barang.modelBarang.kategori',
            'details.subLokasi',
        ]);

        $data = [
            'kunjungan' => $kunjunganMaintenance,
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ];

        $pdf = Pdf::loadView('reports.kunjungan_maintenance_pdf', $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'BAP-Maintenance-' . str_replace(' ', '-', strtolower($kunjunganMaintenance->lokasi->nama)) . '-' . $kunjunganMaintenance->nomor_kunjungan . '.pdf';

        return $pdf->stream($filename);
    }
}
