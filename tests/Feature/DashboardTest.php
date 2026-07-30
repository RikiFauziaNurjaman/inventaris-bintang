<?php

use App\Models\Barang;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('pencarian cepat menemukan barang tanpa rak dan menampilkan detailnya', function () {
    $kategori = KategoriBarang::create(['nama' => 'Komputer']);
    $merek = MerekBarang::create(['nama' => 'Lenovo']);
    $jenis = JenisBarang::create(['kategori_id' => $kategori->id, 'nama' => 'Laptop']);
    $model = ModelBarang::create([
        'kategori_id' => $kategori->id,
        'merek_id' => $merek->id,
        'jenis_id' => $jenis->id,
        'nama' => 'ThinkPad T14',
    ]);
    $lokasi = Lokasi::create(['nama' => 'Kantor Cabang', 'alamat' => 'Bandung', 'is_gudang' => false]);
    $barang = Barang::create([
        'jenis_barang_id' => $jenis->id,
        'lokasi_id' => $lokasi->id,
        'model_id' => $model->id,
        'serial_number' => 'SN-SEARCH-001',
        'kondisi_awal' => 'baru',
        'status' => 'baik',
    ]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('dashboard.fast-search', ['q' => 'thinkpad']))
        ->assertOk()
        ->assertJsonPath('data.0.id', $barang->id)
        ->assertJsonPath('data.0.model', 'ThinkPad T14');

    $this->actingAs($user)
        ->getJson(route('dashboard.barang-detail', $barang))
        ->assertOk()
        ->assertJsonPath('lokasi', 'Kantor Cabang')
        ->assertJsonPath('rak.nama_rak', '-');
});
