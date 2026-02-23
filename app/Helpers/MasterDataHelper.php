<?php

namespace App\Helpers;

use App\Models\AsalBarang;
use App\Models\JenisBarang;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\RakBarang;
use Illuminate\Support\Facades\Cache;

/**
 * Helper untuk caching data master agar tidak perlu query berulang.
 */
class MasterDataHelper
{
    /**
     * Cache duration in seconds (5 menit)
     */
    private const CACHE_TTL = 300;

    /**
     * Get cached kategori list with only necessary columns.
     */
    public static function getKategoriList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_kategori_list', self::CACHE_TTL, function () {
            return KategoriBarang::select('id', 'nama')->orderBy('nama')->get();
        });
    }

    /**
     * Get cached merek list with only necessary columns.
     */
    public static function getMerekList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_merek_list', self::CACHE_TTL, function () {
            return MerekBarang::select('id', 'nama')->orderBy('nama')->get();
        });
    }

    /**
     * Get cached merek list with model relations.
     */
    public static function getMerekWithModel(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_merek_with_model', self::CACHE_TTL, function () {
            return MerekBarang::with('modelBarang:id,merek_id,nama,jenis_id,kategori_id')
                ->select('id', 'nama')
                ->orderBy('nama')
                ->get();
        });
    }

    /**
     * Get cached model list with only necessary columns.
     */
    public static function getModelList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_model_list', self::CACHE_TTL, function () {
            return ModelBarang::select('id', 'nama', 'kategori_id', 'merek_id', 'jenis_id')
                ->orderBy('nama')
                ->get();
        });
    }

    /**
     * Get cached model list with relations.
     */
    public static function getModelWithRelations(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_model_with_relations', self::CACHE_TTL, function () {
            return ModelBarang::with([
                    'merek:id,nama',
                    'jenis:id,nama,kategori_id',
                    'jenis.kategori:id,nama'
                ])
                ->select('id', 'nama', 'kategori_id', 'merek_id', 'jenis_id')
                ->orderBy('nama')
                ->get();
        });
    }

    /**
     * Get cached jenis list with only necessary columns.
     */
    public static function getJenisList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_jenis_list', self::CACHE_TTL, function () {
            return JenisBarang::select('id', 'nama', 'kategori_id')->orderBy('nama')->get();
        });
    }

    /**
     * Get cached lokasi list.
     */
    public static function getLokasiList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_lokasi_list', self::CACHE_TTL, function () {
            return Lokasi::select('id', 'nama', 'is_gudang')->orderBy('nama')->get();
        });
    }

    /**
     * Get cached lokasi gudang only.
     */
    public static function getLokasiGudang(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_lokasi_gudang', self::CACHE_TTL, function () {
            return Lokasi::where('is_gudang', true)
                ->select('id', 'nama')
                ->get();
        });
    }

    /**
     * Get cached lokasi non-gudang only.
     */
    public static function getLokasiNonGudang(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_lokasi_non_gudang', self::CACHE_TTL, function () {
            return Lokasi::where('is_gudang', false)
                ->select('id', 'nama')
                ->get();
        });
    }

    /**
     * Get cached asal barang list.
     */
    public static function getAsalList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_asal_list', self::CACHE_TTL, function () {
            return AsalBarang::select('id', 'nama')->orderBy('nama')->get();
        });
    }

    /**
     * Get cached rak list with only necessary columns.
     */
    public static function getRakList(): \Illuminate\Support\Collection
    {
        return Cache::remember('master_rak_list', self::CACHE_TTL, function () {
            return RakBarang::select('id', 'nama_rak', 'kode_rak', 'lokasi_id')->get();
        });
    }

    /**
     * Clear all master data caches.
     * Call this when master data is updated.
     */
    public static function clearAllCaches(): void
    {
        Cache::forget('master_kategori_list');
        Cache::forget('master_merek_list');
        Cache::forget('master_merek_with_model');
        Cache::forget('master_model_list');
        Cache::forget('master_model_with_relations');
        Cache::forget('master_jenis_list');
        Cache::forget('master_lokasi_list');
        Cache::forget('master_lokasi_gudang');
        Cache::forget('master_lokasi_non_gudang');
        Cache::forget('master_asal_list');
        Cache::forget('master_rak_list');
    }

    /**
     * Clear specific cache by key.
     */
    public static function clearCache(string $key): void
    {
        Cache::forget("master_{$key}");
    }
}
