<?php

namespace App\Http\Controllers\Stock\Distribusi;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Lokasi;
use App\Models\ModelBarang;
use App\Models\RekapStokBarang;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StokDistribusiController extends Controller
{
    public function index()
    {
        
        // PERBAIKAN: "use ($request)" telah dihapus karena tidak didefinisikan dan tidak digunakan

            $stokDistribusi = RekapStokBarang::with([
                    'lokasi' => function ($q) {
                        $q->where('is_gudang', false); // Hanya lokasi selain gudang
                    },
                    'modelBarang.merek',
                ])
                ->whereHas('lokasi', function ($q) {
                    $q->where('is_gudang', false); // Filter hanya lokasi non-gudang
                })
                ->where('jumlah_tersedia', '>', 0) // Hanya stok tersedia
                ->get()
                ->groupBy('lokasi_id')
                ->map(function ($items) {
                    $first = $items->first();
                    $models = $items->map(function ($item) {
                        $merek = $item->modelBarang->merek->nama ?? '';
                        $model = $item->modelBarang->nama ?? '';
                        return trim($merek . ' ' . $model);
                    })->unique()->toArray();

                    return [
                        'lokasi_id' => $first->lokasi->id,
                        'lokasi' => $first->lokasi->nama,
                        'models' => $models,
                        'jumlah_tersedia' => $items->sum('jumlah_tersedia'),
                    ];
                })->values();

            $data = [
                'stokDistribusi' => $stokDistribusi,
            ];

        return Inertia::render('stock/distribusi/index', $data);
    }

    public function exportPdf()
    {
        $stokDistribusi = RekapStokBarang::with([
                'lokasi' => function ($q) {
                    $q->where('is_gudang', false);
                },
                'modelBarang.merek',
            ])
            ->whereHas('lokasi', function ($q) {
                $q->where('is_gudang', false);
            })
            ->where('jumlah_tersedia', '>', 0)
            ->get()
            ->groupBy('lokasi_id')
            ->map(function ($items) {
                $first = $items->first();
                $models = $items->map(function ($item) {
                    $merek = $item->modelBarang->merek->nama ?? '';
                    $model = $item->modelBarang->nama ?? '';
                    return trim($merek . ' ' . $model);
                })->unique()->toArray();

                return [
                    'lokasi' => $first->lokasi->nama,
                    'models' => $models,
                    'jumlah_tersedia' => $items->sum('jumlah_tersedia'),
                ];
            })->values();

        $data = [
            'stokDistribusi' => $stokDistribusi,
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ];

        $pdf = Pdf::loadView('reports.stok_distribusi_pdf', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-stok-distribusi-'.date('Ymd').'.pdf');
    }

    public function getDetailAsJson(ModelBarang $modelBarang, Lokasi $lokasi)
    {
        $barangList = Barang::query()
            ->where('model_id', $modelBarang->id)
            ->where('lokasi_id', $lokasi->id)
            ->select('id', 'serial_number', 'status') // Pilih kolom yang relevan
            ->latest('created_at')
            ->get();

        return response()->json($barangList);
    }
}
