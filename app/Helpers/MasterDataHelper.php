<?php

namespace App\Helpers;

use App\Models\AsalBarang;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\RakBarang;

/**
 * Helper untuk mengambil data master.
 */
class MasterDataHelper
{
    /**
     * Get kategori list with only necessary columns.
     */
    public static function getKategoriList(): \Illuminate\Support\Collection
    {
        return KategoriBarang::select('id', 'nama')->orderBy('nama')->get();
    }

    /**
     * Get merek list with only necessary columns.
     */
    public static function getMerekList(): \Illuminate\Support\Collection
    {
        return MerekBarang::select('id', 'nama')->orderBy('nama')->get();
    }

    /**
     * Get merek list with model relations.
     */
    public static function getMerekWithModel(): \Illuminate\Support\Collection
    {
        return MerekBarang::with('modelBarang:id,merek_id,nama,jenis_id,kategori_id')
            ->select('id', 'nama')
            ->orderBy('nama')
            ->get();
    }

    /**
     * Get model list with only necessary columns.
     */
    public static function getModelList(): \Illuminate\Support\Collection
    {
        return ModelBarang::select('id', 'nama', 'kategori_id', 'merek_id', 'jenis_id')
            ->orderBy('nama')
            ->get();
    }

    /**
     * Get model list with relations.
     */
    public static function getModelWithRelations(): \Illuminate\Support\Collection
    {
        return ModelBarang::with([
                'merek:id,nama',
                'jenis:id,nama,kategori_id',
                'jenis.kategori:id,nama'
            ])
            ->select('id', 'nama', 'kategori_id', 'merek_id', 'jenis_id')
            ->orderBy('nama')
            ->get();
    }

    /**
     * Get jenis list with only necessary columns.
     */
    public static function getJenisList(): \Illuminate\Support\Collection
    {
        return JenisBarang::select('id', 'nama', 'kategori_id')->orderBy('nama')->get();
    }

    /**
     * Get lokasi list.
     */
    public static function getLokasiList(): \Illuminate\Support\Collection
    {
        return Lokasi::select('id', 'nama', 'is_gudang')->orderBy('nama')->get();
    }

    /**
     * Get lokasi gudang only.
     */
    public static function getLokasiGudang(): \Illuminate\Support\Collection
    {
        return Lokasi::where('is_gudang', true)
            ->select('id', 'nama')
            ->get();
    }

    /**
     * Get lokasi non-gudang only.
     */
    public static function getLokasiNonGudang(): \Illuminate\Support\Collection
    {
        return Lokasi::where('is_gudang', false)
            ->select('id', 'nama')
            ->get();
    }

    /**
     * Get asal barang list.
     */
    public static function getAsalList(): \Illuminate\Support\Collection
    {
        return AsalBarang::select('id', 'nama')->orderBy('nama')->get();
    }

    /**
     * Get rak list with only necessary columns.
     */
    public static function getRakList(): \Illuminate\Support\Collection
    {
        return RakBarang::select('id', 'nama_rak', 'kode_rak', 'lokasi_id')->get();
    }

    /**
     * Clear all master data caches.
     * No-op since caching is disabled (no Redis).
     */
    public static function clearAllCaches(): void
    {
        // No caching in use — nothing to clear.
    }

    /**
     * Clear specific cache by key.
     * No-op since caching is disabled (no Redis).
     */
    public static function clearCache(string $key): void
    {
        // No caching in use — nothing to clear.
    }
}
