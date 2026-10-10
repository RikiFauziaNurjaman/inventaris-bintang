<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Buat semua Permissions dari Enum
        $allPermissions = [];
        foreach (PermissionEnum::cases() as $permission) {
            $createdPermission = Permission::firstOrCreate([
                'name' => $permission->value,
                'guard_name' => 'web',
            ]);
            $allPermissions[] = $createdPermission->name;
        }

        // 2. Definisi Hak Akses untuk masing-masing Role
        // ----------------------------------------------------
        // A. Admin Operasional: Mengelola seluruh aktivitas inventaris harian
        $adminPermissions = [
            // Dashboard
            PermissionEnum::VIEW_DASHBOARD->value,

            // Master Data
            PermissionEnum::VIEW_KATEGORI->value,
            PermissionEnum::CREATE_KATEGORI->value,
            PermissionEnum::EDIT_KATEGORI->value,
            PermissionEnum::DELETE_KATEGORI->value,
            PermissionEnum::VIEW_MEREK->value,
            PermissionEnum::CREATE_MEREK->value,
            PermissionEnum::EDIT_MEREK->value,
            PermissionEnum::DELETE_MEREK->value,
            PermissionEnum::VIEW_MODEL->value,
            PermissionEnum::CREATE_MODEL->value,
            PermissionEnum::EDIT_MODEL->value,
            PermissionEnum::DELETE_MODEL->value,
            PermissionEnum::VIEW_JENIS->value,
            PermissionEnum::CREATE_JENIS->value,
            PermissionEnum::EDIT_JENIS->value,
            PermissionEnum::DELETE_JENIS->value,
            PermissionEnum::VIEW_ASAL_BARANG->value,
            PermissionEnum::CREATE_ASAL_BARANG->value,
            PermissionEnum::EDIT_ASAL_BARANG->value,
            PermissionEnum::DELETE_ASAL_BARANG->value,
            PermissionEnum::VIEW_LOKASI_DISTRIBUSI->value,
            PermissionEnum::CREATE_LOKASI_DISTRIBUSI->value,
            PermissionEnum::EDIT_LOKASI_DISTRIBUSI->value,
            PermissionEnum::DELETE_LOKASI_DISTRIBUSI->value,
            PermissionEnum::VIEW_RAK_BARANG->value,
            PermissionEnum::CREATE_RAK_BARANG->value,
            PermissionEnum::EDIT_RAK_BARANG->value,
            PermissionEnum::DELETE_RAK_BARANG->value,
            PermissionEnum::VIEW_BARANG_INVENTARIS->value,
            PermissionEnum::CREATE_BARANG_INVENTARIS->value,
            PermissionEnum::EDIT_BARANG_INVENTARIS->value,
            PermissionEnum::DELETE_BARANG_INVENTARIS->value,

            // Transaksi
            PermissionEnum::VIEW_TRANSAKSI->value,
            PermissionEnum::VIEW_BARANG_MASUK->value,
            PermissionEnum::CREATE_BARANG_MASUK->value,
            PermissionEnum::EDIT_BARANG_MASUK->value,
            PermissionEnum::DELETE_BARANG_MASUK->value,
            PermissionEnum::VIEW_BARANG_KELUAR->value,
            PermissionEnum::CREATE_BARANG_KELUAR->value,
            PermissionEnum::EDIT_BARANG_KELUAR->value,
            PermissionEnum::DELETE_BARANG_KELUAR->value,
            PermissionEnum::VIEW_BARANG_KEMBALI->value,
            PermissionEnum::CREATE_BARANG_KEMBALI->value,
            PermissionEnum::EDIT_BARANG_KEMBALI->value,
            PermissionEnum::DELETE_BARANG_KEMBALI->value,

            // Manajemen Stok
            PermissionEnum::VIEW_STOK_DASHBOARD->value,
            PermissionEnum::VIEW_STOK_GUDANG->value,
            PermissionEnum::EDIT_STOK_GUDANG->value,
            PermissionEnum::VIEW_STOK_DISTRIBUSI->value,
            PermissionEnum::EDIT_STOK_DISTRIBUSI->value,
            PermissionEnum::VIEW_STOK_TERJUAL->value,
            PermissionEnum::EDIT_STOK_TERJUAL->value,
            PermissionEnum::VIEW_STOK_DIPERBAIKI->value,
            PermissionEnum::EDIT_STOK_DIPERBAIKI->value,
            PermissionEnum::VIEW_STOK_RUSAK->value,
            PermissionEnum::EDIT_STOK_RUSAK->value,
            PermissionEnum::APPROVE_STOK_RUSAK->value,
            PermissionEnum::VIEW_STOK_TOTAL->value,
            PermissionEnum::EDIT_STOK_TOTAL->value,

            // Stock Opname
            PermissionEnum::VIEW_STOCK_OPNAME->value,
            PermissionEnum::CREATE_STOCK_OPNAME->value,
            PermissionEnum::EDIT_STOCK_OPNAME->value,
            PermissionEnum::DELETE_STOCK_OPNAME->value,
            PermissionEnum::PARTICIPATE_STOCK_OPNAME->value,
            PermissionEnum::APPROVE_STOCK_OPNAME->value,

            // Laporan
            PermissionEnum::VIEW_DASHBOARD_LAPORAN->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_MASUK->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KELUAR->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KEMBALI->value,
            PermissionEnum::VIEW_LAPORAN_MUTASI->value,

            // User Management (View & Edit user)
            PermissionEnum::VIEW_USER->value,
            PermissionEnum::CREATE_USER->value,
            PermissionEnum::EDIT_USER->value,

            // Setting
            PermissionEnum::VIEW_SETTING->value,
            PermissionEnum::EDIT_SETTING->value,
        ];

        // B. Petugas Gudang: Input transaksi barang masuk, keluar, kembali, dan periksa stok
        $petugasGudangPermissions = [
            PermissionEnum::VIEW_DASHBOARD->value,

            // Master Data (Read-only)
            PermissionEnum::VIEW_KATEGORI->value,
            PermissionEnum::VIEW_MEREK->value,
            PermissionEnum::VIEW_MODEL->value,
            PermissionEnum::VIEW_JENIS->value,
            PermissionEnum::VIEW_ASAL_BARANG->value,
            PermissionEnum::VIEW_LOKASI_DISTRIBUSI->value,
            PermissionEnum::VIEW_RAK_BARANG->value,
            PermissionEnum::VIEW_BARANG_INVENTARIS->value,

            // Transaksi (View, Create, Edit)
            PermissionEnum::VIEW_TRANSAKSI->value,
            PermissionEnum::VIEW_BARANG_MASUK->value,
            PermissionEnum::CREATE_BARANG_MASUK->value,
            PermissionEnum::EDIT_BARANG_MASUK->value,
            PermissionEnum::VIEW_BARANG_KELUAR->value,
            PermissionEnum::CREATE_BARANG_KELUAR->value,
            PermissionEnum::EDIT_BARANG_KELUAR->value,
            PermissionEnum::VIEW_BARANG_KEMBALI->value,
            PermissionEnum::CREATE_BARANG_KEMBALI->value,
            PermissionEnum::EDIT_BARANG_KEMBALI->value,

            // Manajemen Stok (View)
            PermissionEnum::VIEW_STOK_DASHBOARD->value,
            PermissionEnum::VIEW_STOK_GUDANG->value,
            PermissionEnum::VIEW_STOK_DISTRIBUSI->value,
            PermissionEnum::VIEW_STOK_TERJUAL->value,
            PermissionEnum::VIEW_STOK_DIPERBAIKI->value,
            PermissionEnum::VIEW_STOK_RUSAK->value,
            PermissionEnum::VIEW_STOK_TOTAL->value,

            // Stock Opname
            PermissionEnum::VIEW_STOCK_OPNAME->value,
            PermissionEnum::PARTICIPATE_STOCK_OPNAME->value,

            // Laporan
            PermissionEnum::VIEW_DASHBOARD_LAPORAN->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_MASUK->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KELUAR->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KEMBALI->value,
        ];

        // C. Petugas Opname: Khusus scan barcode / cek fisik saat stock opname
        $petugasOpnamePermissions = [
            PermissionEnum::VIEW_DASHBOARD->value,
            PermissionEnum::VIEW_BARANG_INVENTARIS->value,
            PermissionEnum::VIEW_STOCK_OPNAME->value,
            PermissionEnum::PARTICIPATE_STOCK_OPNAME->value,
        ];

        // D. Manajer / Pimpinan: Monitoring laporan, stok, dan approval
        $manajerPermissions = [
            PermissionEnum::VIEW_DASHBOARD->value,

            // View Master
            PermissionEnum::VIEW_KATEGORI->value,
            PermissionEnum::VIEW_MEREK->value,
            PermissionEnum::VIEW_MODEL->value,
            PermissionEnum::VIEW_JENIS->value,
            PermissionEnum::VIEW_ASAL_BARANG->value,
            PermissionEnum::VIEW_LOKASI_DISTRIBUSI->value,
            PermissionEnum::VIEW_RAK_BARANG->value,
            PermissionEnum::VIEW_BARANG_INVENTARIS->value,

            // View Transaksi
            PermissionEnum::VIEW_TRANSAKSI->value,
            PermissionEnum::VIEW_BARANG_MASUK->value,
            PermissionEnum::VIEW_BARANG_KELUAR->value,
            PermissionEnum::VIEW_BARANG_KEMBALI->value,

            // Stok View & Approve
            PermissionEnum::VIEW_STOK_DASHBOARD->value,
            PermissionEnum::VIEW_STOK_GUDANG->value,
            PermissionEnum::VIEW_STOK_DISTRIBUSI->value,
            PermissionEnum::VIEW_STOK_TERJUAL->value,
            PermissionEnum::VIEW_STOK_DIPERBAIKI->value,
            PermissionEnum::VIEW_STOK_RUSAK->value,
            PermissionEnum::APPROVE_STOK_RUSAK->value,
            PermissionEnum::VIEW_STOK_TOTAL->value,

            // Stock Opname View & Approve
            PermissionEnum::VIEW_STOCK_OPNAME->value,
            PermissionEnum::APPROVE_STOCK_OPNAME->value,

            // Seluruh Laporan
            PermissionEnum::VIEW_DASHBOARD_LAPORAN->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_MASUK->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KELUAR->value,
            PermissionEnum::VIEW_LAPORAN_BARANG_KEMBALI->value,
            PermissionEnum::VIEW_LAPORAN_MUTASI->value,

            // View User
            PermissionEnum::VIEW_USER->value,
        ];

        // 3. Mapping Role dan Sinkronisasi Permissions
        $roles = [
            'super-admin'    => $allPermissions,
            'developer'      => $allPermissions,
            'admin'          => $adminPermissions,
            'petugas-gudang' => $petugasGudangPermissions,
            'petugas-opname' => $petugasOpnamePermissions,
            'manajer'        => $manajerPermissions,
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
            $role->syncPermissions($permissions);
        }
    }
}
