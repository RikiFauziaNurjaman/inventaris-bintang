<?php

namespace App\Enums;

enum PermissionEnum: string
{
    case VIEW_DASHBOARD = 'view-dashboard';

    // Data Master
    case VIEW_KATEGORI = 'view-kategori';
    case CREATE_KATEGORI = 'create-kategori';
    case EDIT_KATEGORI = 'edit-kategori';
    case DELETE_KATEGORI = 'delete-kategori';

    case VIEW_MEREK = 'view-merek';
    case CREATE_MEREK = 'create-merek';
    case EDIT_MEREK = 'edit-merek';
    case DELETE_MEREK = 'delete-merek';

    case VIEW_MODEL = 'view-model';
    case CREATE_MODEL = 'create-model';
    case EDIT_MODEL = 'edit-model';
    case DELETE_MODEL = 'delete-model';

    case VIEW_JENIS = 'view-jenis';
    case CREATE_JENIS = 'create-jenis';
    case EDIT_JENIS = 'edit-jenis';
    case DELETE_JENIS = 'delete-jenis';

    case VIEW_ASAL_BARANG = 'view-asal-barang';
    case CREATE_ASAL_BARANG = 'create-asal-barang';
    case EDIT_ASAL_BARANG = 'edit-asal-barang';
    case DELETE_ASAL_BARANG = 'delete-asal-barang';

    case VIEW_LOKASI_DISTRIBUSI = 'view-lokasi-distribusi';
    case CREATE_LOKASI_DISTRIBUSI = 'create-lokasi-distribusi';
    case EDIT_LOKASI_DISTRIBUSI = 'edit-lokasi-distribusi';
    case DELETE_LOKASI_DISTRIBUSI = 'delete-lokasi-distribusi';

    case VIEW_RAK_BARANG = 'view-rak-barang';
    case CREATE_RAK_BARANG = 'create-rak-barang';
    case EDIT_RAK_BARANG = 'edit-rak-barang';
    case DELETE_RAK_BARANG = 'delete-rak-barang';

    case VIEW_BARANG_INVENTARIS = 'view-barang-inventaris';
    case CREATE_BARANG_INVENTARIS = 'create-barang-inventaris';
    case EDIT_BARANG_INVENTARIS = 'edit-barang-inventaris';
    case DELETE_BARANG_INVENTARIS = 'delete-barang-inventaris';

    // Transaksi
    case VIEW_BARANG_MASUK = 'view-barang-masuk';
    case CREATE_BARANG_MASUK = 'create-barang-masuk';
    case EDIT_BARANG_MASUK = 'edit-barang-masuk';
    case DELETE_BARANG_MASUK = 'delete-barang-masuk';

    case VIEW_BARANG_KELUAR = 'view-barang-keluar';
    case CREATE_BARANG_KELUAR = 'create-barang-keluar';
    case EDIT_BARANG_KELUAR = 'edit-barang-keluar';
    case DELETE_BARANG_KELUAR = 'delete-barang-keluar';

    case VIEW_BARANG_KEMBALI = 'view-barang-kembali';
    case CREATE_BARANG_KEMBALI = 'create-barang-kembali';
    case EDIT_BARANG_KEMBALI = 'edit-barang-kembali';
    case DELETE_BARANG_KEMBALI = 'delete-barang-kembali';

    // Manajemen Stok
    case VIEW_STOK_GUDANG = 'view-stok-gudang';
    case EDIT_STOK_GUDANG = 'edit-stok-gudang';

    case VIEW_STOK_DISTRIBUSI = 'view-stok-distribusi';
    case EDIT_STOK_DISTRIBUSI = 'edit-stok-distribusi';

    case VIEW_STOK_TERJUAL = 'view-stok-terjual';
    case EDIT_STOK_TERJUAL = 'edit-stok-terjual';

    case VIEW_STOK_DIPERBAIKI = 'view-stok-diperbaiki';
    case EDIT_STOK_DIPERBAIKI = 'edit-stok-diperbaiki';

    case VIEW_STOK_RUSAK = 'view-stok-rusak';
    case EDIT_STOK_RUSAK = 'edit-stok-rusak';

    case VIEW_STOK_TOTAL = 'view-stok-total';
    case EDIT_STOK_TOTAL = 'edit-stok-total';

    // Stock Opname
    case VIEW_STOCK_OPNAME = 'view-stock-opname';
    case CREATE_STOCK_OPNAME = 'create-stock-opname';
    case EDIT_STOCK_OPNAME = 'edit-stock-opname';
    case DELETE_STOCK_OPNAME = 'delete-stock-opname';
    case PARTICIPATE_STOCK_OPNAME = 'participate-stock-opname';
    case APPROVE_STOCK_OPNAME = 'approve-stock-opname';

    // Laporan
    case VIEW_DASHBOARD_LAPORAN = 'view-dashboard-laporan';
    case VIEW_LAPORAN_BARANG_MASUK = 'view-laporan-barang-masuk';
    case VIEW_LAPORAN_BARANG_KELUAR = 'view-laporan-barang-keluar';
    case VIEW_LAPORAN_BARANG_KEMBALI = 'view-laporan-barang-kembali';
    case VIEW_LAPORAN_MUTASI = 'view-laporan-mutasi';

    // User Management
    case VIEW_USER = 'view-user';
    case CREATE_USER = 'create-user';
    case EDIT_USER = 'edit-user';
    case DELETE_USER = 'delete-user';

    case VIEW_ROLE = 'view-role';
    case CREATE_ROLE = 'create-role';
    case EDIT_ROLE = 'edit-role';
    case DELETE_ROLE = 'delete-role';

    case VIEW_PERMISSION = 'view-permission';
    case EDIT_PERMISSION = 'edit-permission';

    // Setting
    case VIEW_SETTING = 'view-setting';
    case EDIT_SETTING = 'edit-setting';

    // Database
    case BACKUP_DATABASE = 'backup-database';
    case IMPORT_DATABASE = 'import-database';
}
