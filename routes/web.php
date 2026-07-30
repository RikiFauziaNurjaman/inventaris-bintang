<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\Auth\Roles\PermissionController;
use App\Http\Controllers\Auth\Roles\RoleController;
use App\Http\Controllers\Auth\Roles\UserController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Laporan\LaporanBarangKeluarController;
use App\Http\Controllers\Laporan\LaporanBarangKembaliController;
use App\Http\Controllers\Laporan\LaporanBarangMasukController;
use App\Http\Controllers\Laporan\MutasiBarangController;
use App\Http\Controllers\MasterData\AsalBarangController;
use App\Http\Controllers\MasterData\DataBarangController;
use App\Http\Controllers\MasterData\JenisBarangController;
use App\Http\Controllers\MasterData\KategoriBarangController;
use App\Http\Controllers\MasterData\LokasiBarangController;
use App\Http\Controllers\MasterData\MerekBarangController;
use App\Http\Controllers\MasterData\ModelBarangController;
use App\Http\Controllers\MasterData\RakBarangController;
use App\Http\Controllers\Settings\DatabaseController;
use App\Http\Controllers\Stock\Distribusi\StokDistribusiController;
use App\Http\Controllers\Stock\Gudang\StockDiperbaikiController;
use App\Http\Controllers\Stock\Gudang\StockOpnameController;
use App\Http\Controllers\Stock\Gudang\StockRusakController;
use App\Http\Controllers\Stock\Gudang\StockTerjualController;
use App\Http\Controllers\Stock\Gudang\StokGudangController;
use App\Http\Controllers\Stock\TotalStockController;
use App\Http\Controllers\Transaksi\BarangKeluarController;
use App\Http\Controllers\Transaksi\BarangKembaliController;
use App\Http\Controllers\Transaksi\BarangMasukController;
use App\Models\Barang;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return Redirect::route('dashboard');
    }

    return Redirect::route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        // ->middleware('can:' . PermissionEnum::VIEW_DASHBOARD->value)
        ->name('dashboard');

    Route::get('/dashboard/fast-search', [DashboardController::class, 'fastSearchSuggestions']);
    Route::get('/dashboard/barang-detail/{id}', [DashboardController::class, 'getBarangDetail']);

    Route::get('/kategori/search', [KategoriBarangController::class, 'search'])->name('kategori.search');
    Route::resource('kategori', KategoriBarangController::class);

    Route::get('/merek/search', [MerekBarangController::class, 'search'])->name('merek.search');
    Route::resource('merek', MerekBarangController::class);

    Route::get('/model/search', [ModelBarangController::class, 'search'])->name('model.search');
    Route::resource('model', ModelBarangController::class);

    Route::get('/lokasi/search', [LokasiBarangController::class, 'search'])->name('lokasi.search');
    Route::resource('lokasi', LokasiBarangController::class);

    Route::get('/jenis-barang/search', [JenisBarangController::class, 'search'])->name('jenis-barang.search');
    Route::get('/api/jenis-by-kategori', [JenisBarangController::class, 'getByKategori'])->name('api.jenis-by-kategori');
    Route::resource('jenis-barang', JenisBarangController::class);

    Route::get('/asal-barang/search', [AsalBarangController::class, 'search'])->name('asal-barang.search');
    Route::resource('asal-barang', AsalBarangController::class);

    Route::get('/rak-barang/search', [RakBarangController::class, 'search'])->name('rak-barang.search');
    Route::resource('rak-barang', RakBarangController::class);

    // Sub-Lokasi routes
    Route::get('/api/sub-lokasi-by-lokasi', [\App\Http\Controllers\MasterData\SubLokasiController::class, 'getByLokasi'])->name('api.sub-lokasi-by-lokasi');
    Route::resource('sub-lokasi', \App\Http\Controllers\MasterData\SubLokasiController::class)->except(['show', 'create', 'edit']);

    // Monitoring routes
    Route::get('/monitoring', [\App\Http\Controllers\MonitoringController::class, 'index'])->name('monitoring.index');
    Route::get('/monitoring/lokasi/{lokasi}', [\App\Http\Controllers\MonitoringController::class, 'showLokasi'])->name('monitoring.lokasi.detail');
    Route::get('/monitoring/lokasi/{lokasi}/export-pdf', [\App\Http\Controllers\MonitoringController::class, 'exportPdf'])->name('monitoring.lokasi.exportPdf');

    Route::resource('barang', DataBarangController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('/permissions/search', [PermissionController::class, 'search'])->name('permission.search');
    Route::resource('permissions', PermissionController::class)->except(['show']);

    Route::get('/roles/search', [RoleController::class, 'search'])->name('role.search');
    Route::resource('roles', RoleController::class)->except(['show']);

    Route::get('/users/search', [UserController::class, 'search'])->name('user.search');
    Route::resource('users', UserController::class)->except(['show']);

    Route::resource('stock-opname', StockOpnameController::class);
    Route::post('/stock-opname/{id}/approve', [StockOpnameController::class, 'approve']);

    Route::redirect('/transaksi', '/dashboard')->name('transaksi.index');

    Route::resource('barang-masuk', BarangMasukController::class);
    Route::get('/ajax/model-barang', [BarangMasukController::class, 'getModelByKategoriMerek']);
    // Route::get('/ajax/jenis-barang', [BarangMasukController::class, 'getJenisByKategori']);
    Route::get('/ajax/jenis-barang', [BarangMasukController::class, 'getJenisBarang']);
    Route::post('/api/cek-serial', function (Request $request) {
        return Barang::whereIn('serial_number', $request->serial_numbers)->pluck('serial_number');
    });

    Route::resource('barang-keluar', BarangKeluarController::class);
    Route::get('/barang-keluar/{id}/cetak-label', [BarangKeluarController::class, 'cetakLabel'])
        ->name('barang-keluar.cetak-label');
    Route::get('/barang-keluar/{barangKeluar}/cetak-label/{detailId}', [BarangKeluarController::class, 'cetakLabelItem'])
        ->name('barang-keluar.cetak-label.item');
    Route::get('/barang-keluar/{id}/cetak-surat', [BarangKeluarController::class, 'cetakSurat'])
        ->name('barang-keluar.cetak-surat');

    Route::resource('barang-kembali', BarangKembaliController::class);
    Route::get('/serial-by-lokasi/{lokasiId}', [BarangKembaliController::class, 'getSerialByLokasi']);
    Route::get('/api/kategori-by-lokasi/{lokasiId}', [BarangKembaliController::class, 'getKategoriByLokasi']);
    Route::get('/api/merek-by-kategori/{lokasiId}/{kategoriNama}', [BarangKembaliController::class, 'getMerekByKategoriDanLokasi']);
    Route::get('/api/model-by-merek/{lokasiId}/{merekNama}', [BarangKembaliController::class, 'getModelByMerekDanLokasi']);
    Route::get('/api/serial-by-model/{lokasiId}/{modelNama}', [BarangKembaliController::class, 'getSerialByModelDanLokasi']);

    Route::redirect('/stok', '/dashboard')->name('stok.index');

    Route::get('/api/stok-gudang-detail/{modelBarang}', [StokGudangController::class, 'getDetailAsJson'])->name('api.stok-gudang.detail');
    Route::get('/stok-gudang', [StokGudangController::class, 'index'])->name('stok.gudang.index');
    Route::get('/stock/gudang/export-pdf', [StokGudangController::class, 'exportPdf'])->name('stock.gudang.exportPdf');

    Route::get('/stok-terjual', [StockTerjualController::class, 'index'])->name('stok.terjual.index');

    Route::prefix('stock-rusak')->name('stock.rusak.')->group(function () {
        Route::get('/', [StockRusakController::class, 'index'])->name('index');
        Route::get('/detail', [StockRusakController::class, 'show'])->name('show');
        Route::post('/pindah-ke-perbaikan', [StockRusakController::class, 'perbaiki'])->name('perbaiki');

        Route::prefix('pemusnahan')->name('pemusnahan.')->group(function () {
            // Halaman daftar pengajuan pemusnahan
            Route::get('/', [StockRusakController::class, 'indexPemusnahan'])->name('index');

            // Aksi untuk mengajukan dari modal
            Route::post('/ajukan', [StockRusakController::class, 'ajukanPemusnahan'])->name('ajukan');

            // Aksi untuk menyetujui (menggunakan method POST/PATCH lebih baik)
            Route::post('/{pemusnahan}/approve', [StockRusakController::class, 'approvePemusnahan'])->name('approve');
        });
    });

    Route::get('/stock-diperbaiki/detail', [StockDiperbaikiController::class, 'show'])->name('stock.perbaikan.show');
    Route::post('/stock-diperbaiki/selesai', [StockDiperbaikiController::class, 'selesaiDiperbaiki'])->name('stock.perbaikan.selesai');
    Route::get('/perbaikan', [StockDiperbaikiController::class, 'index'])->name('stok.gudang.perbaikan');

    Route::get('/stok-distribusi', [StokDistribusiController::class, 'index'])->name('stok.distribusi.index');
    Route::get('/stok-distribusi/export-pdf', [StokDistribusiController::class, 'exportPdf'])->name('stok.distribusi.exportPdf');
    Route::get('/api/stok-distribusi-detail/{modelBarang}/{lokasi}', [StokDistribusiController::class, 'getDetailAsJson'])->name('api.stok-distribusi.detail');

    Route::resource('total-stock', TotalStockController::class)->only(['index', 'destroy']);
    Route::patch('/total-stock/{id}/kondisi', [TotalStockController::class, 'updateKondisi'])->name('total-stock.updateKondisi');
    Route::get('/total-stock/export-pdf', [TotalStockController::class, 'exportPdf'])->name('total-stock.exportPdf');

    // Database Backup & Import
    Route::get('/database', [DatabaseController::class, 'index'])->name('database.index');
    Route::post('/database/backup', [DatabaseController::class, 'backup'])->name('database.backup');
    Route::post('/database/import', [DatabaseController::class, 'import'])->name('database.import');
    Route::get('/database/download/{filename}', [DatabaseController::class, 'download'])->name('database.download');
    Route::delete('/database/{filename}', [DatabaseController::class, 'destroy'])->name('database.destroy');

    // Laporan routes — dipindah ke dalam K6BypassAuth middleware group
    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::redirect('/', '/laporan/masuk')->name('index');

        Route::get('/masuk', [LaporanBarangMasukController::class, 'index'])->name('masuk');
        Route::get('/masuk/excel', [LaporanBarangMasukController::class, 'exportBarangMasukExcel'])->name('masuk.export');
        Route::get('/masuk/pdf', [LaporanBarangMasukController::class, 'exportBarangMasukPdf'])->name('masuk.pdf');

        Route::get('/keluar', [LaporanBarangKeluarController::class, 'index'])->name('keluar');
        Route::get('/keluar/excel', [LaporanBarangKeluarController::class, 'exportBarangKeluarExcel'])->name('keluar.export');
        Route::get('/keluar/pdf', [LaporanBarangKeluarController::class, 'exportBarangKeluarPdf'])->name('keluar.pdf');

        Route::get('/kembali', [LaporanBarangKembaliController::class, 'index'])->name('kembali');
        Route::get('/kembali/excel', [LaporanBarangKembaliController::class, 'exportBarangKembaliExcel'])->name('kembali.export');
        Route::get('/kembali/pdf', [LaporanBarangKembaliController::class, 'exportBarangKembaliPdf'])->name('kembali.pdf');

        Route::get('/mutasi', [MutasiBarangController::class, 'index'])->name('mutasi');
        Route::get('/mutasi/export', [MutasiBarangController::class, 'exportMutasi'])->name('mutasi.export');
        Route::get('/mutasi/pdf', [MutasiBarangController::class, 'exportMutasiPdf'])->name('mutasi.pdf');
    });

    // AI Assistant Chat
    Route::post('/api/ai-chat', [AiChatController::class, 'chat'])->name('api.ai-chat');
    Route::get('/api/ai-chat/suggestions', [AiChatController::class, 'suggestions'])->name('api.ai-chat.suggestions');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
