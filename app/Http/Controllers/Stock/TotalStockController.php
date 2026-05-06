<?php

namespace App\Http\Controllers\Stock;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TotalStockController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil query dasar
        $query = $this->getBaseQuery();

        // 2. Terapkan filter dari request
        $this->applyFilters($query, $request);

        // 3. Terapkan pengurutan
        $this->applyOrdering($query);

        // 4. Ambil data dengan paginasi
        $barang = $query->paginate(20)->withQueryString();

        // 5. Siapkan opsi untuk dropdown filter di frontend
        $filterOptions = [
            'kategoriList' => DB::table('kategori_barang')->orderBy('nama')->pluck('nama'),
            'lokasiList'   => DB::table('lokasi')->orderBy('nama')->pluck('nama'),
            'statusList'   => DB::table('barang')->distinct()->pluck('status'),
            'kondisiList'  => DB::table('barang')->distinct()->pluck('kondisi_awal'),
        ];

        return Inertia::render('stock/total/index', [
            'barangList'    => $barang,
            'filters'       => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'filterOptions' => $filterOptions,
        ]);
    }

    public function exportPdf(Request $request)
    {
        // 1. Ambil query dasar
        $query = $this->getBaseQuery();

        // 2. Terapkan filter yang sama dengan halaman index
        $this->applyFilters($query, $request);

        // 3. Terapkan pengurutan yang sama
        $this->applyOrdering($query);

        // 4. Ambil semua data yang cocok (tanpa paginasi)
        $barangList = $query->get();

        // Siapkan data tambahan untuk view PDF
        $data = [
            'barangList'   => $barangList,
            'filters'      => $request->only(['search', 'kategori', 'lokasi', 'status', 'kondisi']),
            'tanggalCetak' => now()->translatedFormat('d F Y'),
        ];

        // 5. Load view PDF dan kirim data
        $pdf = Pdf::loadView('reports.stock_total_pdf', $data);

        // Atur ukuran kertas dan orientasi
        $pdf->setPaper('a4', 'landscape');

        // 6. Stream PDF ke browser untuk diunduh
        return $pdf->stream('laporan-total-stok-'.date('Ymd').'.pdf');
    }

    private function applyFilters($query, Request $request)
    {
        if ($search = $request->input('search')) {
            $search = strtolower($search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(barang.serial_number) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(model_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(merek_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(kategori_barang.nama) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(lokasi.nama) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($kategori = $request->input('kategori')) {
            $query->where('kategori_barang.nama', $kategori);
        }

        if ($lokasi = $request->input('lokasi')) {
            $query->where('lokasi.nama', $lokasi);
        }

        if ($status = $request->input('status')) {
            $query->where('barang.status', $status);
        }

        if ($kondisi = $request->input('kondisi')) {
            $query->where('barang.kondisi_awal', $kondisi);
        }
    }

    private function getBaseQuery()
    {
        return DB::table('barang')
            ->leftJoin('model_barang', 'barang.model_id', '=', 'model_barang.id')
            ->leftJoin('merek_barang', 'model_barang.merek_id', '=', 'merek_barang.id')
            ->leftJoin('kategori_barang', 'model_barang.kategori_id', '=', 'kategori_barang.id')
            ->leftJoin('rak_barang', 'barang.rak_id', '=', 'rak_barang.id')
            ->leftJoin('lokasi', 'barang.lokasi_id', '=', 'lokasi.id')
            ->select([
                'barang.id',
                'barang.serial_number',
                'model_barang.label as label',
                'merek_barang.nama as merek',
                'model_barang.nama as model',
                DB::raw("CONCAT(merek_barang.nama, ' - ', model_barang.nama) AS merek_model"),
                'kategori_barang.nama as kategori',
                'rak_barang.nama_rak',
                'rak_barang.kode_rak',
                'rak_barang.baris',
                'barang.status as status_awal',
                'barang.kondisi_awal as kondisi',
                'lokasi.nama as lokasi',
                'lokasi.is_gudang',
            ]);
    }

    private function applyOrdering($query)
    {
        $query->orderBy('lokasi.nama')
            ->orderBy('kategori_barang.nama')
            ->orderBy('merek_barang.nama')
            ->orderBy('model_barang.nama')
            ->orderBy('barang.status');
    }

    public function destroy($id)
    {
        $barang = DB::table('barang')->where('id', $id);

        if ($barang->doesntExist()) {
            return redirect()->back()->with('error', 'Data barang tidak ditemukan.');
        }

        $barang->delete();

        return redirect()->route('total-stock.index')->with('success', 'Data barang berhasil dihapus.');
    }

    public function updateKondisi(Request $request, $id)
    {
        $request->validate([
            'kondisi' => 'required|string|in:baru,second',
        ]);

        $barang = DB::table('barang')->where('id', $id);

        if ($barang->doesntExist()) {
            return redirect()->back()->with('error', 'Data barang tidak ditemukan.');
        }

        $barang->update([
            'kondisi_awal' => $request->kondisi
        ]);

        return redirect()->back()->with('success', 'Kondisi barang berhasil diperbarui.');
    }
}
