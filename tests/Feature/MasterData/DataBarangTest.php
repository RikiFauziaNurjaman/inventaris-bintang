<?php

use App\Enums\PermissionEnum;
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
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

function inventoryFixture(): array
{
    $kategori = KategoriBarang::create(['nama' => 'Elektronik']);
    $merek = MerekBarang::create(['nama' => 'Lenovo']);
    $jenis = JenisBarang::create(['kategori_id' => $kategori->id, 'nama' => 'Laptop']);
    $model = ModelBarang::create([
        'kategori_id' => $kategori->id,
        'merek_id' => $merek->id,
        'jenis_id' => $jenis->id,
        'nama' => 'ThinkPad E14',
    ]);
    $gudang = Lokasi::create(['nama' => 'Gudang Utama', 'alamat' => 'Jakarta', 'is_gudang' => true]);
    $rak = RakBarang::create(['lokasi_id' => $gudang->id, 'nama_rak' => 'Rak A', 'kode_rak' => 'A-01']);
    $asal = AsalBarang::create(['nama' => 'Pembelian']);

    return compact('model', 'gudang', 'rak', 'asal');
}

function inventoryUser(array $permissions): User
{
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission);
    }

    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

function inventoryBarang(array $fixture, string $serial = 'SN-001'): array
{
    $user = User::factory()->create();
    $barangMasuk = BarangMasuk::create([
        'tanggal' => '2026-07-30',
        'asal_barang_id' => $fixture['asal']->id,
        'user_id' => $user->id,
    ]);
    $barang = Barang::create([
        'model_id' => $fixture['model']->id,
        'jenis_barang_id' => $fixture['model']->jenis_id,
        'asal_id' => $fixture['asal']->id,
        'lokasi_id' => $fixture['gudang']->id,
        'rak_id' => $fixture['rak']->id,
        'serial_number' => $serial,
        'kondisi_awal' => 'baru',
        'status' => 'baik',
        'pic' => 'Petugas Gudang',
        'catatan' => 'Unit uji',
    ]);
    BarangMasukDetail::create(['barang_masuk_id' => $barangMasuk->id, 'barang_id' => $barang->id]);
    MutasiBarang::create([
        'barang_id' => $barang->id,
        'user_id' => $user->id,
        'lokasi_asal_id' => null,
        'lokasi_tujuan_id' => $fixture['gudang']->id,
        'tanggal' => '2026-07-30',
        'keterangan' => 'Barang masuk',
    ]);

    return compact('barang', 'barangMasuk');
}

test('data barang dilindungi permission khusus', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('barang.index'))
        ->assertForbidden();

    $this->actingAs(inventoryUser([PermissionEnum::VIEW_BARANG_INVENTARIS->value]))
        ->get(route('barang.index'))
        ->assertOk();
});

test('daftar barang mendukung pencarian dan pagination', function () {
    $fixture = inventoryFixture();
    $user = inventoryUser([PermissionEnum::VIEW_BARANG_INVENTARIS->value]);

    foreach (range(1, 21) as $number) {
        Barang::create([
            'model_id' => $fixture['model']->id,
            'jenis_barang_id' => $fixture['model']->jenis_id,
            'lokasi_id' => $fixture['gudang']->id,
            'serial_number' => sprintf('SN-%03d', $number),
            'kondisi_awal' => 'baru',
            'status' => 'baik',
        ]);
    }

    $this->actingAs($user)
        ->get(route('barang.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('master/barang/index')
            ->where('barangList.per_page', 20)
            ->where('barangList.total', 21)
            ->has('barangList.data', 20));

    $this->actingAs($user)
        ->get(route('barang.index', ['search' => 'SN-021']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'SN-021')
            ->where('barangList.from', 1)
            ->where('barangList.to', 1)
            ->where('barangList.total', 1)
            ->has('barangList.data', 1));
});

test('pdf data barang mengikuti permission dan filter aktif', function () {
    $fixture = inventoryFixture();
    inventoryBarang($fixture);

    $this->actingAs(User::factory()->create())
        ->get(route('barang.exportPdf'))
        ->assertForbidden();

    $viewer = inventoryUser([PermissionEnum::VIEW_BARANG_INVENTARIS->value]);
    $this->actingAs($viewer)
        ->get(route('barang.exportPdf', ['search' => 'SN-001', 'kondisi' => 'baru']))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('tambah dan hapus barang hanya tersedia melalui transaksi barang masuk', function () {
    expect(Route::has('barang.store'))->toBeFalse()
        ->and(Route::has('barang.destroy'))->toBeFalse();
});

test('edit hanya menerima metadata aman', function () {
    $fixture = inventoryFixture();
    ['barang' => $barang] = inventoryBarang($fixture);
    $editor = inventoryUser([PermissionEnum::EDIT_BARANG_INVENTARIS->value]);

    $this->actingAs($editor)
        ->put(route('barang.update', $barang), [
            'serial_number' => 'SN-001-EDIT',
            'kondisi_awal' => 'second',
            'rak_id' => $fixture['rak']->id,
            'sub_lokasi_id' => null,
            'pic' => 'PIC Baru',
            'catatan' => 'Catatan baru',
        ])
        ->assertRedirect(route('barang.index'));

    $this->assertDatabaseHas('barang', [
        'id' => $barang->id,
        'serial_number' => 'SN-001-EDIT',
        'kondisi_awal' => 'second',
        'pic' => 'PIC Baru',
    ]);

    $this->actingAs($editor)
        ->from(route('barang.index'))
        ->put(route('barang.update', $barang), [
            'serial_number' => 'SN-001-EDIT',
            'kondisi_awal' => 'second',
            'model_id' => $fixture['model']->id,
        ])
        ->assertSessionHasErrors('model_id');

    MutasiBarang::create([
        'barang_id' => $barang->id,
        'user_id' => $editor->id,
        'lokasi_asal_id' => $fixture['gudang']->id,
        'lokasi_tujuan_id' => $fixture['gudang']->id,
        'tanggal' => '2026-07-31',
        'keterangan' => 'Aktivitas lanjutan',
    ]);

    $this->actingAs($editor)
        ->from(route('barang.index'))
        ->put(route('barang.update', $barang), [
            'serial_number' => 'SN-TIDAK-BOLEH-DIUBAH',
            'kondisi_awal' => 'second',
            'rak_id' => $fixture['rak']->id,
            'sub_lokasi_id' => null,
            'pic' => 'PIC Baru',
            'catatan' => 'Catatan baru',
        ])
        ->assertSessionHasErrors('serial_number');
});

test('pembatalan transaksi barang masuk ditolak setelah barang beraktivitas', function () {
    $fixture = inventoryFixture();
    ['barang' => $barang, 'barangMasuk' => $barangMasuk] = inventoryBarang($fixture);
    $user = User::factory()->create();

    MutasiBarang::create([
        'barang_id' => $barang->id,
        'user_id' => $user->id,
        'lokasi_asal_id' => $fixture['gudang']->id,
        'lokasi_tujuan_id' => $fixture['gudang']->id,
        'tanggal' => '2026-07-31',
        'keterangan' => 'Aktivitas lanjutan',
    ]);

    $this->actingAs($user)
        ->from(route('barang-masuk.index'))
        ->delete(route('barang-masuk.destroy', $barangMasuk))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('barang', ['id' => $barang->id]);
    $this->assertDatabaseHas('barang_masuk', ['id' => $barangMasuk->id]);
});
