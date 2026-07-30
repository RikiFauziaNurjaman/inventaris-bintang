<?php

use App\Enums\PermissionEnum;
use App\Models\Barang;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

function opnameFixture(): array
{
    $kategori = KategoriBarang::create(['nama' => 'Printer']);
    $merek = MerekBarang::create(['nama' => 'Zebra']);
    $jenis = JenisBarang::create(['kategori_id' => $kategori->id, 'nama' => 'Thermal']);
    $model = ModelBarang::create([
        'kategori_id' => $kategori->id,
        'merek_id' => $merek->id,
        'jenis_id' => $jenis->id,
        'nama' => 'ZD230',
    ]);
    $lokasi = Lokasi::create(['nama' => 'Gudang A', 'alamat' => 'Jakarta', 'is_gudang' => true]);
    $lokasiLain = Lokasi::create(['nama' => 'Cabang B', 'alamat' => 'Bandung', 'is_gudang' => false]);

    $barang = Barang::create([
        'model_id' => $model->id,
        'jenis_barang_id' => $jenis->id,
        'lokasi_id' => $lokasi->id,
        'serial_number' => 'SN-EXPECTED',
        'kondisi_awal' => 'baru',
        'status' => 'baik',
    ]);
    $barangLain = Barang::create([
        'model_id' => $model->id,
        'jenis_barang_id' => $jenis->id,
        'lokasi_id' => $lokasiLain->id,
        'serial_number' => 'SN-OTHER',
        'kondisi_awal' => 'baru',
        'status' => 'baik',
    ]);

    return compact('model', 'lokasi', 'lokasiLain', 'barang', 'barangLain');
}

function opnameUser(array $permissions): User
{
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission);
    }

    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('stock opname dilindungi permission dan membuat snapshot lokasi', function () {
    $fixture = opnameFixture();

    $this->actingAs(User::factory()->create())
        ->get(route('stock-opname.index'))
        ->assertForbidden();

    $creator = opnameUser([PermissionEnum::CREATE_STOCK_OPNAME->value]);
    $this->actingAs($creator)
        ->post(route('stock-opname.store'), [
            'tanggal' => '2026-07-30',
            'lokasi_id' => $fixture['lokasi']->id,
            'catatan' => 'Audit awal',
        ])
        ->assertRedirect();

    $opname = StockOpname::firstOrFail();
    expect($opname->status)->toBe('active')
        ->and($opname->items()->count())->toBe(1);
    $this->assertDatabaseHas('stock_opname_item', [
        'stock_opname_id' => $opname->id,
        'barang_id' => $fixture['barang']->id,
        'normalized_serial' => 'SN-EXPECTED',
        'state' => 'pending',
    ]);

    $this->actingAs($creator)
        ->from(route('stock-opname.create'))
        ->post(route('stock-opname.store'), [
            'tanggal' => '2026-07-30',
            'lokasi_id' => $fixture['lokasi']->id,
        ])
        ->assertSessionHasErrors('lokasi_id');
});

test('banyak petugas memindai serial tanpa hitungan ganda dan temuan diklasifikasikan', function () {
    $fixture = opnameFixture();
    $creator = opnameUser([PermissionEnum::CREATE_STOCK_OPNAME->value]);
    $participant = opnameUser([PermissionEnum::PARTICIPATE_STOCK_OPNAME->value]);
    $participantLain = opnameUser([PermissionEnum::PARTICIPATE_STOCK_OPNAME->value]);

    $this->actingAs($creator)->post(route('stock-opname.store'), [
        'tanggal' => '2026-07-30',
        'lokasi_id' => $fixture['lokasi']->id,
    ]);
    $opname = StockOpname::firstOrFail();

    $this->actingAs($participant)
        ->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => ' sn-expected '])
        ->assertOk()
        ->assertJsonPath('result', 'found')
        ->assertJsonPath('progress.found', 1);

    $this->actingAs($participantLain)
        ->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-EXPECTED'])
        ->assertOk()
        ->assertJsonPath('result', 'duplicate')
        ->assertJsonPath('progress.found', 1);

    $this->actingAs($participant)
        ->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-OTHER'])
        ->assertJsonPath('result', 'wrong_location');

    $this->actingAs($participant)
        ->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-UNKNOWN'])
        ->assertJsonPath('result', 'unknown');

    expect($opname->items()->where('normalized_serial', 'SN-EXPECTED')->count())->toBe(1)
        ->and($opname->items()->where('state', 'wrong_location')->count())->toBe(1)
        ->and($opname->items()->where('state', 'unknown')->count())->toBe(1);
});

test('petugas hanya dapat membatalkan scan sendiri', function () {
    $fixture = opnameFixture();
    $creator = opnameUser([PermissionEnum::CREATE_STOCK_OPNAME->value]);
    $participant = opnameUser([PermissionEnum::PARTICIPATE_STOCK_OPNAME->value]);
    $other = opnameUser([PermissionEnum::PARTICIPATE_STOCK_OPNAME->value]);

    $this->actingAs($creator)->post(route('stock-opname.store'), [
        'tanggal' => '2026-07-30',
        'lokasi_id' => $fixture['lokasi']->id,
    ]);
    $opname = StockOpname::firstOrFail();
    $this->actingAs($participant)->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-EXPECTED']);
    $item = $opname->items()->where('state', 'found')->firstOrFail();

    $this->actingAs($other)
        ->deleteJson(route('stock-opname.scans.destroy', [$opname, $item]))
        ->assertForbidden();

    $this->actingAs($participant)
        ->deleteJson(route('stock-opname.scans.destroy', [$opname, $item]))
        ->assertOk();

    $this->assertDatabaseHas('stock_opname_item', ['id' => $item->id, 'state' => 'pending', 'scanned_by' => null]);
});

test('approval mengunci audit tanpa mengubah barang atau rekap stok', function () {
    $fixture = opnameFixture();
    $creator = opnameUser([
        PermissionEnum::CREATE_STOCK_OPNAME->value,
        PermissionEnum::PARTICIPATE_STOCK_OPNAME->value,
    ]);
    $approver = opnameUser([PermissionEnum::APPROVE_STOCK_OPNAME->value]);

    $this->actingAs($creator)->post(route('stock-opname.store'), [
        'tanggal' => '2026-07-30',
        'lokasi_id' => $fixture['lokasi']->id,
    ]);
    $opname = StockOpname::firstOrFail();
    $this->actingAs($creator)->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-UNKNOWN']);
    $barangBefore = Barang::count();
    $rekapBefore = DB::table('rekap_stok_barang')->get()->toArray();

    $this->actingAs($creator)->post(route('stock-opname.submit', $opname))->assertRedirect();
    $this->actingAs($approver)->post(route('stock-opname.approve', $opname))->assertRedirect();

    expect($opname->fresh()->status)->toBe('approved')
        ->and(Barang::count())->toBe($barangBefore)
        ->and(DB::table('rekap_stok_barang')->get()->toArray())->toEqual($rekapBefore);

    $this->actingAs($creator)
        ->postJson(route('stock-opname.scans.store', $opname), ['serial_number' => 'SN-EXPECTED'])
        ->assertStatus(409);
});

test('pdf hasil opname hanya tersedia setelah audit disetujui', function () {
    $fixture = opnameFixture();
    $creator = opnameUser([
        PermissionEnum::CREATE_STOCK_OPNAME->value,
        PermissionEnum::VIEW_STOCK_OPNAME->value,
    ]);
    $approver = opnameUser([PermissionEnum::APPROVE_STOCK_OPNAME->value]);

    $this->actingAs($creator)->post(route('stock-opname.store'), [
        'tanggal' => '2026-07-30',
        'lokasi_id' => $fixture['lokasi']->id,
    ]);
    $opname = StockOpname::firstOrFail();

    $this->actingAs($creator)
        ->get(route('stock-opname.pdf', $opname))
        ->assertStatus(409);

    $this->actingAs($creator)->post(route('stock-opname.submit', $opname));
    $this->actingAs($approver)->post(route('stock-opname.approve', $opname));

    $this->actingAs($creator)
        ->get(route('stock-opname.pdf', $opname))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('cek aset menampilkan status pendaftaran dan kecocokan lokasi', function () {
    $fixture = opnameFixture();
    $viewer = opnameUser([PermissionEnum::VIEW_BARANG_INVENTARIS->value]);

    $this->actingAs(User::factory()->create())->get(route('cek-aset.index'))->assertForbidden();

    $this->actingAs($viewer)
        ->getJson(route('cek-aset.lookup', [
            'serial_number' => 'sn-expected',
            'lokasi_id' => $fixture['lokasi']->id,
        ]))
        ->assertOk()
        ->assertJsonPath('registered', true)
        ->assertJsonPath('location_match', true)
        ->assertJsonPath('barang.serial_number', 'SN-EXPECTED');

    $this->actingAs($viewer)
        ->getJson(route('cek-aset.lookup', ['serial_number' => 'TIDAK-ADA']))
        ->assertOk()
        ->assertJsonPath('registered', false);
});
