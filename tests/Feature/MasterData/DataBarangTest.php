<?php

use App\Enums\PermissionEnum;
use App\Models\AsalBarang;
use App\Models\Barang;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\MutasiBarang;
use App\Models\RakBarang;
use App\Models\User;
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

function inventoryPayload(array $fixture, array $overrides = []): array
{
    return array_merge([
        'tanggal' => '2026-07-30',
        'model_id' => $fixture['model']->id,
        'asal_id' => $fixture['asal']->id,
        'lokasi_id' => $fixture['gudang']->id,
        'rak_id' => $fixture['rak']->id,
        'serial_number' => 'SN-001',
        'kondisi_awal' => 'baru',
        'pic' => 'Petugas Gudang',
        'catatan' => 'Unit uji',
    ], $overrides);
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

test('menambah barang mencatat transaksi mutasi dan rekap stok', function () {
    $fixture = inventoryFixture();
    $user = inventoryUser([PermissionEnum::CREATE_BARANG_INVENTARIS->value]);

    $this->actingAs($user)
        ->post(route('barang.store'), inventoryPayload($fixture))
        ->assertRedirect(route('barang.index'))
        ->assertSessionHas('message');

    $barang = Barang::where('serial_number', 'SN-001')->firstOrFail();
    $this->assertDatabaseHas('barang_masuk_detail', ['barang_id' => $barang->id]);
    $this->assertDatabaseHas('mutasi_barang', [
        'barang_id' => $barang->id,
        'lokasi_asal_id' => null,
        'lokasi_tujuan_id' => $fixture['gudang']->id,
    ]);
    $this->assertDatabaseHas('rekap_stok_barang', [
        'model_id' => $fixture['model']->id,
        'lokasi_id' => $fixture['gudang']->id,
        'jumlah_total' => 1,
        'jumlah_tersedia' => 1,
    ]);
});

test('validasi menolak serial duplikat model tanpa jenis dan rak dari lokasi lain', function () {
    $fixture = inventoryFixture();
    $user = inventoryUser([PermissionEnum::CREATE_BARANG_INVENTARIS->value]);
    Barang::create([
        'model_id' => $fixture['model']->id,
        'jenis_barang_id' => $fixture['model']->jenis_id,
        'lokasi_id' => $fixture['gudang']->id,
        'serial_number' => 'SN-001',
        'kondisi_awal' => 'baru',
        'status' => 'baik',
    ]);

    $this->actingAs($user)
        ->from(route('barang.index'))
        ->post(route('barang.store'), inventoryPayload($fixture))
        ->assertSessionHasErrors('serial_number');

    $modelTanpaJenis = ModelBarang::create([
        'kategori_id' => $fixture['model']->kategori_id,
        'merek_id' => $fixture['model']->merek_id,
        'nama' => 'Tanpa Jenis',
    ]);
    $this->actingAs($user)
        ->from(route('barang.index'))
        ->post(route('barang.store'), inventoryPayload($fixture, ['model_id' => $modelTanpaJenis->id, 'serial_number' => 'SN-002']))
        ->assertSessionHasErrors('model_id');

    $gudangLain = Lokasi::create(['nama' => 'Gudang Lain', 'alamat' => 'Bandung', 'is_gudang' => true]);
    $rakLain = RakBarang::create(['lokasi_id' => $gudangLain->id, 'nama_rak' => 'Rak B', 'kode_rak' => 'B-01']);
    $this->actingAs($user)
        ->from(route('barang.index'))
        ->post(route('barang.store'), inventoryPayload($fixture, ['rak_id' => $rakLain->id, 'serial_number' => 'SN-003']))
        ->assertSessionHasErrors('rak_id');
});

test('edit hanya menerima metadata aman', function () {
    $fixture = inventoryFixture();
    $creator = inventoryUser([PermissionEnum::CREATE_BARANG_INVENTARIS->value]);
    $this->actingAs($creator)->post(route('barang.store'), inventoryPayload($fixture));
    $barang = Barang::where('serial_number', 'SN-001')->firstOrFail();
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
});

test('hapus membatalkan stok barang baru tetapi menolak barang yang sudah bergerak', function () {
    $fixture = inventoryFixture();
    $user = inventoryUser([
        PermissionEnum::CREATE_BARANG_INVENTARIS->value,
        PermissionEnum::DELETE_BARANG_INVENTARIS->value,
    ]);

    $this->actingAs($user)->post(route('barang.store'), inventoryPayload($fixture));
    $barang = Barang::where('serial_number', 'SN-001')->firstOrFail();
    $this->actingAs($user)->delete(route('barang.destroy', $barang))->assertSessionHas('message');
    $this->assertDatabaseMissing('barang', ['id' => $barang->id]);
    $this->assertDatabaseHas('rekap_stok_barang', [
        'model_id' => $fixture['model']->id,
        'lokasi_id' => $fixture['gudang']->id,
        'jumlah_total' => 0,
        'jumlah_tersedia' => 0,
    ]);

    $this->actingAs($user)->post(route('barang.store'), inventoryPayload($fixture, ['serial_number' => 'SN-002']));
    $barangAktif = Barang::where('serial_number', 'SN-002')->firstOrFail();
    MutasiBarang::create([
        'barang_id' => $barangAktif->id,
        'user_id' => $user->id,
        'lokasi_asal_id' => $fixture['gudang']->id,
        'lokasi_tujuan_id' => $fixture['gudang']->id,
        'tanggal' => '2026-07-31',
        'keterangan' => 'Aktivitas uji',
    ]);

    $this->actingAs($user)->delete(route('barang.destroy', $barangAktif))->assertSessionHas('error');
    $this->assertDatabaseHas('barang', ['id' => $barangAktif->id]);
});
