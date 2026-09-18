export type LokasiOption = {
    id: number;
    nama: string;
    alamat?: string;
    total_printer?: number;
};

export type SubLokasiOption = {
    id: number;
    nama: string;
    lantai?: string;
};

export type KunjunganDetail = {
    id?: number;
    kunjungan_id?: number;
    barang_id: number;
    sub_lokasi_id?: number | null;
    kondisi_sebelumnya?: string;
    kondisi_fisik: 'baik' | 'perlu_perbaikan' | 'rusak';
    status_operasional: 'normal' | 'gangguan_ringan' | 'rusak_total';
    counter_cetak?: number | null;
    kondisi_print_head?: string | null;
    kondisi_tinta_ribbon?: string | null;
    kondisi_roller_mekanikal?: string | null;
    tindakan?: string | null;
    catatan?: string | null;
    sync_status_barang?: boolean;

    // Joined relations for display
    barang?: {
        id: number;
        serial_number: string;
        model_barang?: {
            id: number;
            nama: string;
            merek?: { id: number; nama: string };
            kategori?: { id: number; nama: string };
        };
    };
    sub_lokasi?: {
        id: number;
        nama: string;
        lantai?: string;
    };
};

export type KunjunganMaintenance = {
    id: number;
    nomor_kunjungan: string;
    lokasi_id: number;
    user_id?: number | null;
    nama_teknisi: string;
    tanggal_kunjungan: string;
    periode_bulan: number;
    jadwal_berikutnya?: string | null;
    status: 'terjadwal' | 'selesai' | 'dibatalkan';
    pic_lokasi?: string | null;
    kontak_pic?: string | null;
    catatan?: string | null;
    created_at?: string;
    updated_at?: string;

    lokasi?: LokasiOption;
    user?: { id: number; name: string };
    details?: KunjunganDetail[];
};

export type JadwalMonitoringItem = {
    lokasi_id: number;
    lokasi_nama: string;
    lokasi_alamat?: string | null;
    total_printer: number;
    kunjungan_terakhir?: string | null;
    nomor_kunjungan_terakhir?: string | null;
    teknisi_terakhir?: string | null;
    periode_bulan: number;
    jadwal_berikutnya?: string | null;
    status_jatuh_tempo: 'overdue' | 'due_soon' | 'up_to_date' | 'never_visited';
    diff_in_days: number;
};

export type PrinterFormItem = {
    barang_id: number;
    serial_number: string;
    model_nama: string;
    merek_nama: string;
    kategori_nama: string;
    sub_lokasi_id?: number | null;
    sub_lokasi_nama?: string;
    pic?: string;
    kondisi_sebelumnya: string;
    counter_terakhir: number;

    // Form inputs
    kondisi_fisik: 'baik' | 'perlu_perbaikan' | 'rusak';
    status_operasional: 'normal' | 'gangguan_ringan' | 'rusak_total';
    counter_cetak?: number | string | null;
    kondisi_print_head: string;
    kondisi_tinta_ribbon: string;
    kondisi_roller_mekanikal: string;
    tindakan: string;
    catatan: string;
    sync_status_barang: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
