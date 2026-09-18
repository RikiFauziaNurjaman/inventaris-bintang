import { BarcodeScannerDialog, ScannerFeedback } from '@/components/barcode-scanner-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Filter,
    Loader2,
    MapPin,
    Printer,
    Save,
    ScanLine,
    Search,
    Sparkles,

} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LokasiOption, PrinterFormItem } from './types';

type Props = {
    lokasiList: LokasiOption[];
    selectedLokasiId?: number | null;
    initialPrinters?: PrinterFormItem[];
    defaultTeknisi: string;
    nomorKunjunganAuto: string;
};

export default function MaintenanceCreate({
    lokasiList,
    selectedLokasiId,
    initialPrinters = [],
    defaultTeknisi,
    nomorKunjunganAuto,
}: Props) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        lokasi_id: selectedLokasiId ? String(selectedLokasiId) : '',
        nama_teknisi: defaultTeknisi || '',
        tanggal_kunjungan: todayStr,
        periode_bulan: 3,
        jadwal_berikutnya: '',
        status: 'selesai',
        pic_lokasi: '',
        kontak_pic: '',
        catatan: '',
        items: initialPrinters as PrinterFormItem[],
    });

    const [loadingPrinters, setLoadingPrinters] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedRuangan, setSelectedRuangan] = useState<string>('all');
    const [highlightedSn, setHighlightedSn] = useState<string | null>(null);

    // Hitung jadwal berikutnya otomatis
    useEffect(() => {
        if (data.tanggal_kunjungan && data.periode_bulan) {
            const date = new Date(data.tanggal_kunjungan);
            date.setMonth(date.getMonth() + Number(data.periode_bulan));
            const nextStr = date.toISOString().split('T')[0];
            setData('jadwal_berikutnya', nextStr);
        }
    }, [data.tanggal_kunjungan, data.periode_bulan]);

    // Ambil daftar printer saat lokasi dipilih
    const fetchPrinters = async (lokasiId: string) => {
        if (!lokasiId) {
            setData('items', []);
            return;
        }

        setLoadingPrinters(true);
        try {
            const res = await axios.get(route('kunjungan-maintenance.printers', lokasiId));
            setData('items', res.data);
            if (res.data.length === 0) {
                toast.error('Tidak ada unit printer berstatus "dipinjamkan" di lokasi ini.');
            } else {
                toast.success(`Berhasil memuat ${res.data.length} unit printer.`);
            }
        } catch (err) {
            toast.error('Gagal mengambil daftar printer di lokasi tersebut.');
        } finally {
            setLoadingPrinters(false);
        }
    };

    const handleLokasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setData('lokasi_id', id);
        setSearchKeyword('');
        setSelectedRuangan('all');
        fetchPrinters(id);
    };

    // Daftar ruangan unik untuk filter tab/chips
    const ruanganList = useMemo(() => {
        const list = new Set<string>();
        data.items.forEach((item) => {
            if (item.sub_lokasi_nama) list.add(item.sub_lokasi_nama);
            else list.add('Lokasi Utama');
        });
        return Array.from(list);
    }, [data.items]);

    // Filter printer berdasarkan search dan ruangan
    const filteredItems = useMemo(() => {
        return data.items
            .map((item, originalIndex) => ({ ...item, originalIndex }))
            .filter((item) => {
                const snMatch = item.serial_number.toLowerCase().includes(searchKeyword.toLowerCase());
                const modelMatch = item.model_nama.toLowerCase().includes(searchKeyword.toLowerCase());
                const merekMatch = item.merek_nama.toLowerCase().includes(searchKeyword.toLowerCase());
                const ruanganNama = item.sub_lokasi_nama || 'Lokasi Utama';
                const ruanganMatch = ruanganNama.toLowerCase().includes(searchKeyword.toLowerCase());

                const matchesKeyword = snMatch || modelMatch || merekMatch || ruanganMatch;

                const matchesRuangan =
                    selectedRuangan === 'all' || ruanganNama === selectedRuangan;

                return matchesKeyword && matchesRuangan;
            });
    }, [data.items, searchKeyword, selectedRuangan]);

    // Handle Barcode Scan
    const handleScanDetected = (scannedSerial: string): ScannerFeedback => {
        const cleanSerial = scannedSerial.trim().toLowerCase();
        const found = data.items.find(
            (it) => it.serial_number.toLowerCase() === cleanSerial || it.serial_number.toLowerCase().includes(cleanSerial)
        );

        if (found) {
            setHighlightedSn(found.serial_number);
            setSearchKeyword(''); // Reset search so card is displayed
            setSelectedRuangan('all'); // Reset ruangan filter

            // Scroll to card smoothly
            setTimeout(() => {
                const el = document.getElementById(`printer-card-${found.serial_number}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);

            // Remove highlight after 4 seconds
            setTimeout(() => {
                setHighlightedSn(null);
            }, 4000);

            toast.success(`Printer SN: ${found.serial_number} ditemukan!`);
            return {
                message: `Ditemukan: ${found.merek_nama} ${found.model_nama} (SN: ${found.serial_number})`,
                tone: 'success',
            };
        } else {
            toast.error(`Serial number "${scannedSerial}" tidak terdaftar di lokasi ini.`);
            return {
                message: `SN "${scannedSerial}" tidak ada di lokasi ini!`,
                tone: 'danger',
            };
        }
    };

    // Tombol Cepat: Set Semua Baik & Normal
    const setAllBaik = () => {
        const updated = data.items.map((item) => ({
            ...item,
            kondisi_fisik: 'baik' as const,
            status_operasional: 'normal' as const,
            kondisi_print_head: 'bagus',
            kondisi_tinta_ribbon: 'cukup',
            kondisi_roller_mekanikal: 'normal',
            tindakan: 'Pembersihan & Pengecekan Rutin',
            catatan: '',
            sync_status_barang: false,
        }));
        setData('items', updated);
        toast.success('Semua printer berhasil di-set kondisi Baik & Normal!');
    };

    const updateItemField = <K extends keyof PrinterFormItem>(
        originalIndex: number,
        field: K,
        value: PrinterFormItem[K]
    ) => {
        const updated = [...data.items];
        updated[originalIndex] = { ...updated[originalIndex], [field]: value };
        setData('items', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.lokasi_id) {
            toast.error('Silakan pilih lokasi pelanggan terlebih dahulu.');
            return;
        }

        if (data.items.length === 0) {
            toast.error('Belum ada unit printer yang dimuat di lokasi ini.');
            return;
        }

        post(route('kunjungan-maintenance.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kunjungan & Maintenance', href: '/kunjungan-maintenance' },
        { title: 'Catat Kunjungan Baru', href: '/kunjungan-maintenance/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catat Kunjungan Maintenance Baru" />

            <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 lg:p-8 pb-28 sm:pb-8">
                {/* Header Title & Back */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Calendar className="size-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Catat Kunjungan Maintenance
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Nomor Rekam:{' '}
                                    <span className="font-mono font-bold text-primary">{nomorKunjunganAuto}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('kunjungan-maintenance.index')}>
                                <ArrowLeft size={16} /> Kembali
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2 shadow-sm">
                            {processing ? <Loader2 className="animate-spin size-4" /> : <Save size={16} />}
                            Simpan Kunjungan
                        </Button>
                    </div>
                </div>

                {/* Form Section 1: Informasi Kunjungan & Lokasi Pelanggan */}
                <Card className="shadow-xs">
                    <CardHeader className="border-b bg-muted/30 pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                            <MapPin className="size-4 text-primary" />
                            Informasi Lokasi & Jadwal Kunjungan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Lokasi Pelanggan */}
                        <div className="space-y-1.5 lg:col-span-2">
                            <Label htmlFor="lokasi_id" className="text-xs font-semibold">
                                Lokasi Pelanggan <span className="text-rose-500">*</span>
                            </Label>
                            <select
                                id="lokasi_id"
                                value={data.lokasi_id}
                                onChange={handleLokasiChange}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 font-medium"
                                required
                            >
                                <option value="">-- Pilih Lokasi Pelanggan --</option>
                                {lokasiList.map((lok) => (
                                    <option key={lok.id} value={lok.id}>
                                        {lok.nama} {lok.total_printer ? `(${lok.total_printer} unit printer)` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.lokasi_id && (
                                <p className="text-xs text-rose-600">{errors.lokasi_id}</p>
                            )}
                        </div>

                        {/* Tanggal Kunjungan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="tanggal_kunjungan" className="text-xs font-semibold">
                                Tanggal Kunjungan <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="tanggal_kunjungan"
                                type="date"
                                value={data.tanggal_kunjungan}
                                onChange={(e) => setData('tanggal_kunjungan', e.target.value)}
                                required
                            />
                            {errors.tanggal_kunjungan && (
                                <p className="text-xs text-rose-600">{errors.tanggal_kunjungan}</p>
                            )}
                        </div>

                        {/* Nama Teknisi */}
                        <div className="space-y-1.5">
                            <Label htmlFor="nama_teknisi" className="text-xs font-semibold">
                                Nama Teknisi Pelaksana <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="nama_teknisi"
                                placeholder="Nama teknisi pelaksana"
                                value={data.nama_teknisi}
                                onChange={(e) => setData('nama_teknisi', e.target.value)}
                                required
                            />
                        </div>

                        {/* PIC Lokasi */}
                        <div className="space-y-1.5">
                            <Label htmlFor="pic_lokasi" className="text-xs font-semibold">
                                PIC / Staf di Lokasi Pelanggan
                            </Label>
                            <Input
                                id="pic_lokasi"
                                placeholder="Nama PIC ruangan / IT"
                                value={data.pic_lokasi}
                                onChange={(e) => setData('pic_lokasi', e.target.value)}
                            />
                        </div>

                        {/* Kontak PIC */}
                        <div className="space-y-1.5">
                            <Label htmlFor="kontak_pic" className="text-xs font-semibold">
                                No. Telepon / WA PIC
                            </Label>
                            <Input
                                id="kontak_pic"
                                placeholder="08xxxxxxxxxx"
                                value={data.kontak_pic}
                                onChange={(e) => setData('kontak_pic', e.target.value)}
                            />
                        </div>

                        {/* Periode Kunjungan Berkala (3 / 6 Bulan) */}
                        <div className="space-y-2 lg:col-span-2">
                            <Label className="text-xs font-semibold block">
                                Periode Kunjungan Berkala
                            </Label>
                            <div className="flex flex-wrap items-center gap-3">
                                {[
                                    { value: 3, label: '3 Bulan Sekali (Rekomendasi)' },
                                    { value: 6, label: '6 Bulan Sekali' },
                                    { value: 1, label: '1 Bulan' },
                                    { value: 12, label: '1 Tahun' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('periode_bulan', opt.value)}
                                        className={cn(
                                            'rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all shadow-xs',
                                            data.periode_bulan === opt.value
                                                ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                                                : 'border-input bg-background hover:bg-muted text-foreground'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tanggal Kunjungan Berikutnya */}
                        <div className="space-y-1.5">
                            <Label htmlFor="jadwal_berikutnya" className="text-xs font-semibold">
                                Target Kunjungan Berikutnya
                            </Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 size-4 text-primary" />
                                <Input
                                    id="jadwal_berikutnya"
                                    type="date"
                                    value={data.jadwal_berikutnya}
                                    onChange={(e) => setData('jadwal_berikutnya', e.target.value)}
                                    className="pl-9 font-semibold text-primary"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Terhitung otomatis +{data.periode_bulan} bulan dari tanggal kunjungan
                            </p>
                        </div>

                        {/* Status Kunjungan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="text-xs font-semibold">
                                Status Kunjungan
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="selesai">Selesai Dilakukan</option>
                                <option value="terjadwal">Masih Terjadwal</option>
                                <option value="dibatalkan">Dibatalkan</option>
                            </select>
                        </div>

                        {/* Catatan Umum */}
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                            <Label htmlFor="catatan" className="text-xs font-semibold">
                                Catatan / Rekomendasi Umum
                            </Label>
                            <textarea
                                id="catatan"
                                rows={2}
                                placeholder="Catatan hasil kunjungan keseluruhan di lokasi ini..."
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Section 2: Lembar Checklist Unit Printer */}
                <div className="space-y-4">
                    {/* Header Bar Checklist + Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Printer className="size-5 text-primary" />
                                Lembar Pemeriksaan Unit Printer ({data.items.length} Unit)
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Scan barcode unit atau gunakan filter pencarian untuk menemukan unit yang sedang Anda periksa
                            </p>
                        </div>

                        {data.items.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Tombol Scan Kamera Barcode */}
                                <Button
                                    type="button"
                                    onClick={() => setScannerOpen(true)}
                                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-sm text-xs"
                                >
                                    <ScanLine size={16} /> Scan Barcode Printer
                                </Button>

                                {/* Tombol Set Semua Baik */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={setAllBaik}
                                    className="gap-1.5 text-xs font-semibold shadow-xs"
                                >
                                    <Sparkles size={14} className="text-primary" />
                                    Set Semua Baik
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* SEARCH & FILTER BAR PER UNIT */}
                    {data.items.length > 0 && (
                        <div className="space-y-3 rounded-xl border bg-card/80 p-3.5 shadow-xs">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Input Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Ketik Serial Number, Model, atau Ruangan..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="pl-9 pr-8 text-sm"
                                    />
                                    {searchKeyword && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchKeyword('')}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Tombol Scan Barcode Mobile / Tablet */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setScannerOpen(true)}
                                    className="gap-2 border-primary/40 text-primary font-semibold sm:hidden"
                                >
                                    <ScanLine size={16} /> Pindai Barcode
                                </Button>
                            </div>

                            {/* Filter Chips Ruangan */}
                            {ruanganList.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                        <Filter size={12} /> Ruangan:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRuangan('all')}
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
                                            selectedRuangan === 'all'
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                        )}
                                    >
                                        Semua Ruangan ({data.items.length})
                                    </button>
                                    {ruanganList.map((ruang) => {
                                        const count = data.items.filter(
                                            (it) => (it.sub_lokasi_nama || 'Lokasi Utama') === ruang
                                        ).length;
                                        return (
                                            <button
                                                key={ruang}
                                                type="button"
                                                onClick={() => setSelectedRuangan(ruang)}
                                                className={cn(
                                                    'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
                                                    selectedRuangan === ruang
                                                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                                )}
                                            >
                                                {ruang} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Status Hasil Filter */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                                <span>
                                    Menampilkan <strong>{filteredItems.length}</strong> dari{' '}
                                    <strong>{data.items.length}</strong> unit printer
                                </span>
                                {(searchKeyword || selectedRuangan !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchKeyword('');
                                            setSelectedRuangan('all');
                                        }}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Tampilkan Semua
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {loadingPrinters && (
                        <div className="flex items-center justify-center p-12 rounded-xl border bg-card text-muted-foreground gap-2">
                            <Loader2 className="animate-spin size-5 text-primary" />
                            <span>Memuat daftar printer di lokasi terpilih...</span>
                        </div>
                    )}

                    {!loadingPrinters && data.items.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20">
                            <Printer className="mx-auto size-10 text-muted-foreground/60 mb-2" />
                            <p className="font-semibold text-foreground">Belum ada unit printer terpilih</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                                Silakan pilih <strong>Lokasi Pelanggan</strong> di atas untuk memuat semua printer yang sedang dipinjamkan di lokasi tersebut.
                            </p>
                        </div>
                    )}

                    {!loadingPrinters && data.items.length > 0 && filteredItems.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20">
                            <Search className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                            <p className="font-semibold text-foreground">Printer tidak ditemukan</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tidak ada printer yang cocok dengan pencarian "{searchKeyword}".
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchKeyword('');
                                    setSelectedRuangan('all');
                                }}
                                className="mt-3"
                            >
                                Reset Pencarian
                            </Button>
                        </div>
                    )}

                    {/* DAFTAR CARD PRINTER */}
                    {!loadingPrinters && filteredItems.length > 0 && (
                        <div className="space-y-4">
                            {filteredItems.map((item) => {
                                const originalIdx = item.originalIndex;
                                const isHighlighted = highlightedSn === item.serial_number;

                                return (
                                    <Card
                                        key={item.barang_id}
                                        id={`printer-card-${item.serial_number}`}
                                        className={cn(
                                            'shadow-xs transition-all border-l-4 duration-300',
                                            item.kondisi_fisik === 'baik' && 'border-l-emerald-500',
                                            item.kondisi_fisik === 'perlu_perbaikan' && 'border-l-amber-500',
                                            item.kondisi_fisik === 'rusak' && 'border-l-rose-500',
                                            isHighlighted &&
                                                'ring-4 ring-blue-500/60 shadow-lg scale-[1.01] bg-blue-50/30 dark:bg-blue-950/20'
                                        )}
                                    >
                                        <CardContent className="p-4 sm:p-5 space-y-4">
                                            {/* Row 1: Header Unit Printer */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
                                                        {originalIdx + 1}
                                                    </span>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-bold text-foreground text-sm sm:text-base">
                                                                {item.merek_nama} {item.model_nama}
                                                            </h4>
                                                            <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">
                                                                SN: {item.serial_number}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <span>
                                                                Ruangan:{' '}
                                                                <strong className="text-foreground">
                                                                    {item.sub_lokasi_nama || 'Lokasi Utama'}
                                                                </strong>
                                                            </span>
                                                            {item.pic && <span>(PIC: {item.pic})</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Kondisi Selector Buttons (Touch Friendly) */}
                                                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemField(originalIdx, 'kondisi_fisik', 'baik')}
                                                        className={cn(
                                                            'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-all text-center',
                                                            item.kondisi_fisik === 'baik'
                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                                        )}
                                                    >
                                                        Baik
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateItemField(originalIdx, 'kondisi_fisik', 'perlu_perbaikan')
                                                        }
                                                        className={cn(
                                                            'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-all text-center',
                                                            item.kondisi_fisik === 'perlu_perbaikan'
                                                                ? 'bg-amber-600 text-white shadow-xs'
                                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                                        )}
                                                    >
                                                        Perlu Perbaikan
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemField(originalIdx, 'kondisi_fisik', 'rusak')}
                                                        className={cn(
                                                            'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-all text-center',
                                                            item.kondisi_fisik === 'rusak'
                                                                ? 'bg-rose-600 text-white shadow-xs'
                                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                                        )}
                                                    >
                                                        Rusak / Kritis
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Row 2: Form Checklist & Readings */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                                                {/* Counter Cetak */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Counter Cetak (Page Count)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Contoh: 15420 (Opsional)"
                                                        value={item.counter_cetak ?? ''}
                                                        onChange={(e) =>
                                                            updateItemField(originalIdx, 'counter_cetak', e.target.value)
                                                        }
                                                        className="font-mono text-sm"
                                                    />
                                                </div>

                                                {/* Status Operasional */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Status Operasional
                                                    </Label>
                                                    <select
                                                        value={item.status_operasional}
                                                        onChange={(e) =>
                                                            updateItemField(
                                                                originalIdx,
                                                                'status_operasional',
                                                                e.target.value as PrinterFormItem['status_operasional']
                                                            )
                                                        }
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    >
                                                        <option value="normal">Berfungsi Normal</option>
                                                        <option value="gangguan_ringan">Ada Gangguan Ringan</option>
                                                        <option value="rusak_total">Rusak / Tidak Berfungsi</option>
                                                    </select>
                                                </div>

                                                {/* Print Head */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Kondisi Print Head
                                                    </Label>
                                                    <select
                                                        value={item.kondisi_print_head}
                                                        onChange={(e) =>
                                                            updateItemField(originalIdx, 'kondisi_print_head', e.target.value)
                                                        }
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    >
                                                        <option value="bagus">Bagus / Tajam</option>
                                                        <option value="bergaris">Hasil Cetak Bergaris</option>
                                                        <option value="pudar">Hasil Cetak Pudar</option>
                                                        <option value="buntu">Head Buntu / Macet</option>
                                                    </select>
                                                </div>

                                                {/* Tinta / Ribbon */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Status Tinta / Ribbon
                                                    </Label>
                                                    <select
                                                        value={item.kondisi_tinta_ribbon}
                                                        onChange={(e) =>
                                                            updateItemField(originalIdx, 'kondisi_tinta_ribbon', e.target.value)
                                                        }
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    >
                                                        <option value="cukup">Cukup Aman (&gt;50%)</option>
                                                        <option value="menipis">Menipis (&lt;20%)</option>
                                                        <option value="habis">Habis Total</option>
                                                        <option value="diganti_baru">Diganti Baru di Tempat</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 3: Roller, Tindakan, Catatan */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                                {/* Roller & Mekanikal */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Roller & Mekanikal Kertas
                                                    </Label>
                                                    <select
                                                        value={item.kondisi_roller_mekanikal}
                                                        onChange={(e) =>
                                                            updateItemField(
                                                                originalIdx,
                                                                'kondisi_roller_mekanikal',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    >
                                                        <option value="normal">Bersih & Menarik Normal</option>
                                                        <option value="kotor">Kotor / Perlu Dibersihkan</option>
                                                        <option value="aus">Roller Aus / Licin</option>
                                                        <option value="macet">Sering Paper Jam (Macet)</option>
                                                    </select>
                                                </div>

                                                {/* Tindakan Teknisi */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Tindakan yang Dilakukan
                                                    </Label>
                                                    <Input
                                                        placeholder="Contoh: Pembersihan roller, ganti ribbon"
                                                        value={item.tindakan}
                                                        onChange={(e) =>
                                                            updateItemField(originalIdx, 'tindakan', e.target.value)
                                                        }
                                                        className="text-xs"
                                                    />
                                                </div>

                                                {/* Catatan Unit */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">
                                                        Catatan / Keluhan Pengguna
                                                    </Label>
                                                    <Input
                                                        placeholder="Keterangan opsional..."
                                                        value={item.catatan}
                                                        onChange={(e) =>
                                                            updateItemField(originalIdx, 'catatan', e.target.value)
                                                        }
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 4: Opsi Sinkronisasi Status Master Barang */}
                                            {item.kondisi_fisik !== 'baik' && (
                                                <div className="flex items-center gap-2 rounded-md bg-amber-50/60 p-2.5 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
                                                    <Checkbox
                                                        id={`sync_${item.barang_id}`}
                                                        checked={item.sync_status_barang}
                                                        onCheckedChange={(checked) =>
                                                            updateItemField(originalIdx, 'sync_status_barang', Boolean(checked))
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`sync_${item.barang_id}`}
                                                        className="cursor-pointer font-medium"
                                                    >
                                                        Sinkronkan status master printer ini menjadi{' '}
                                                        <strong>
                                                            {item.kondisi_fisik === 'rusak' ? 'Rusak' : 'Dalam Perbaikan'}
                                                        </strong>{' '}
                                                        di sistem inventaris
                                                    </label>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sticky Bottom Bar on Mobile / Desktop */}
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md shadow-lg sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {data.items.length > 0 && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setScannerOpen(true)}
                                        className="sm:hidden gap-1 text-xs border-primary text-primary"
                                    >
                                        <ScanLine size={14} /> Scan
                                    </Button>
                                    <span className="font-medium hidden sm:inline">
                                        Total: <strong>{data.items.length}</strong> unit printer
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href={route('kunjungan-maintenance.index')}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing} size="sm" className="gap-2 shadow-sm font-semibold">
                                {processing ? <Loader2 className="animate-spin size-4" /> : <Save size={16} />}
                                Simpan Kunjungan
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Dialog Scanner Barcode */}
            <BarcodeScannerDialog
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onDetected={handleScanDetected}
                title="Pindai Barcode / SN Printer"
                continuous={false}
            />
        </AppLayout>
    );
}
