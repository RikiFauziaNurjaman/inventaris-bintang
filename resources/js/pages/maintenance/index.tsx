import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Eye,
    FileDown,
    MapPin,
    MoreHorizontal,
    Pencil,
    Plus,
    Printer,
    RotateCcw,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { KunjunganDetailModal } from './detail-modal';
import { JadwalMonitoringItem, KunjunganMaintenance, LokasiOption, PaginatedData } from './types';

type Props = {
    kunjunganPaginated: PaginatedData<KunjunganMaintenance>;
    jadwalMonitoring: JadwalMonitoringItem[];
    stats: {
        total_kunjungan: number;
        total_lokasi: number;
        overdue: number;
        due_soon: number;
        up_to_date: number;
        never_visited: number;
    };
    filters: {
        lokasi_id?: string;
        status?: string;
        tanggal_mulai?: string;
        tanggal_akhir?: string;
        search?: string;
        tab?: string;
        per_page?: number;
    };
    activeTab: 'riwayat' | 'jadwal';
    lokasiOptions: LokasiOption[];
};

export default function MaintenanceIndex({
    kunjunganPaginated,
    jadwalMonitoring,
    stats,
    filters,
    activeTab: initialTab,
    lokasiOptions,
}: Props) {
    const [currentTab, setCurrentTab] = useState<'riwayat' | 'jadwal'>(initialTab || 'riwayat');
    const [selectedKunjungan, setSelectedKunjungan] = useState<KunjunganMaintenance | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<KunjunganMaintenance | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        lokasi_id: filters.lokasi_id || '',
        status: filters.status || '',
        tanggal_mulai: filters.tanggal_mulai || '',
        tanggal_akhir: filters.tanggal_akhir || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kunjungan & Maintenance', href: '/kunjungan-maintenance' },
    ];

    const applyFilters = (next: typeof filterData) => {
        router.get(
            route('kunjungan-maintenance.index'),
            { ...next, tab: currentTab },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearch = useDebouncedCallback((val: string) => {
        const next = { ...filterData, search: val };
        setFilterData(next);
        applyFilters(next);
    }, 400);

    const updateFilter = (key: keyof typeof filterData, val: string) => {
        const next = { ...filterData, [key]: val };
        setFilterData(next);
        applyFilters(next);
    };

    const resetFilters = () => {
        const empty = {
            search: '',
            lokasi_id: '',
            status: '',
            tanggal_mulai: '',
            tanggal_akhir: '',
        };
        setFilterData(empty);
        router.get(route('kunjungan-maintenance.index'), { tab: currentTab });
    };

    const handleDelete = () => {
        if (!pendingDelete) return;
        setDeleting(true);
        router.delete(route('kunjungan-maintenance.destroy', pendingDelete.id), {
            onSuccess: () => {
                toast.success(`Kunjungan ${pendingDelete.nomor_kunjungan} berhasil dihapus`);
                setPendingDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus data kunjungan');
            },
            onFinish: () => setDeleting(false),
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'selesai':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> Selesai
                    </span>
                );
            case 'terjadwal':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                        <Clock size={12} /> Terjadwal
                    </span>
                );
            case 'dibatalkan':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                        <AlertCircle size={12} /> Dibatalkan
                    </span>
                );
            default:
                return <span className="text-xs text-muted-foreground">{status}</span>;
        }
    };

    const getJatuhTempoBadge = (item: JadwalMonitoringItem) => {
        switch (item.status_jatuh_tempo) {
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                        <AlertTriangle size={12} /> Jatuh Tempo ({Math.abs(item.diff_in_days)} hari lalu)
                    </span>
                );
            case 'due_soon':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        <Clock size={12} /> Segera ({item.diff_in_days} hari lagi)
                    </span>
                );
            case 'up_to_date':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> Sesuai Jadwal ({item.diff_in_days} hari lagi)
                    </span>
                );
            case 'never_visited':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Belum Pernah Dikunjungi
                    </span>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kunjungan & Maintenance Rutin" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header Title & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-primary/10 p-2 text-primary">
                                <CalendarCheck className="size-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Kunjungan & Maintenance Rutin
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Pencatatan inspeksi berkala (3 atau 6 bulan) untuk printer yang dipinjamkan di lokasi pelanggan
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild className="gap-2 shadow-sm">
                            <Link href={route('kunjungan-maintenance.create')}>
                                <Plus size={16} /> Catat Kunjungan Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <Card className="border-l-4 border-l-primary shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">Kunjungan Selesai</p>
                                <CheckCircle2 className="size-4 text-primary" />
                            </div>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total_kunjungan}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Total inspeksi tercatat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">Lokasi Pelanggan</p>
                                <MapPin className="size-4 text-blue-500" />
                            </div>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                                {stats.total_lokasi}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Dengan printer aktif</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-rose-500 shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Jatuh Tempo</p>
                                <AlertTriangle className="size-4 text-rose-500" />
                            </div>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                                {stats.overdue}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Perlu segera dikunjungi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Mendekati Jadwal</p>
                                <Clock className="size-4 text-amber-500" />
                            </div>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                                {stats.due_soon}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Jatuh tempo ≤ 30 hari</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-xs col-span-2 sm:col-span-1">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Jadwal Aman</p>
                                <CheckCircle2 className="size-4 text-emerald-500" />
                            </div>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                {stats.up_to_date}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Sesuai siklus periode</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentTab('riwayat');
                                router.get(route('kunjungan-maintenance.index'), { tab: 'riwayat' }, { preserveState: true });
                            }}
                            className={cn(
                                'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors',
                                currentTab === 'riwayat'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                            )}
                        >
                            <Calendar className="size-4" />
                            Riwayat Kunjungan
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                {kunjunganPaginated.total}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setCurrentTab('jadwal');
                                router.get(route('kunjungan-maintenance.index'), { tab: 'jadwal' }, { preserveState: true });
                            }}
                            className={cn(
                                'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors',
                                currentTab === 'jadwal'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                            )}
                        >
                            <Clock className="size-4" />
                            Monitoring Jadwal & Jatuh Tempo (3 / 6 Bulan)
                            {stats.overdue > 0 && (
                                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                                    {stats.overdue} Overdue
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab 1 Content: Riwayat Kunjungan */}
                {currentTab === 'riwayat' && (
                    <div className="space-y-4">
                        {/* Filters Bar */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nomor kunjungan, teknisi, PIC, serial number..."
                                    defaultValue={filterData.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div>
                                <select
                                    value={filterData.lokasi_id}
                                    onChange={(e) => updateFilter('lokasi_id', e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="">Semua Lokasi Pelanggan</option>
                                    {lokasiOptions.map((lok) => (
                                        <option key={lok.id} value={lok.id}>
                                            {lok.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    value={filterData.status}
                                    onChange={(e) => updateFilter('status', e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="terjadwal">Terjadwal</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="w-full gap-1.5"
                                >
                                    <RotateCcw size={14} /> Reset
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                                        <tr>
                                            <th className="p-3.5">Nomor & Tanggal</th>
                                            <th className="p-3.5">Lokasi Pelanggan</th>
                                            <th className="p-3.5">Teknisi & PIC</th>
                                            <th className="p-3.5 text-center">Unit Diperiksa</th>
                                            <th className="p-3.5 text-center">Kondisi Hasil Cek</th>
                                            <th className="p-3.5">Jadwal Berikutnya</th>
                                            <th className="p-3.5 text-center">Status</th>
                                            <th className="p-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {kunjunganPaginated.data.map((item) => {
                                            const details = item.details || [];
                                            const totalUnit = details.length;
                                            const cntBaik = details.filter((d) => d.kondisi_fisik === 'baik').length;
                                            const cntPerbaikan = details.filter((d) => d.kondisi_fisik === 'perlu_perbaikan').length;
                                            const cntRusak = details.filter((d) => d.kondisi_fisik === 'rusak').length;

                                            return (
                                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3.5">
                                                        <span className="font-mono font-semibold text-primary block">
                                                            {item.nomor_kunjungan}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className="font-medium text-foreground block">
                                                            {item.lokasi?.nama || '-'}
                                                        </span>
                                                        {item.lokasi?.alamat && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {item.lokasi.alamat}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="text-xs">
                                                            <span className="font-medium text-foreground block">
                                                                {item.nama_teknisi}
                                                            </span>
                                                            {item.pic_lokasi && (
                                                                <span className="text-muted-foreground block">
                                                                    PIC: {item.pic_lokasi}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground text-xs">
                                                            <Printer size={12} /> {totalUnit} Unit
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        <div className="flex items-center justify-center gap-1.5 text-xs">
                                                            {cntBaik > 0 && (
                                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                                    {cntBaik} Baik
                                                                </span>
                                                            )}
                                                            {cntPerbaikan > 0 && (
                                                                <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-400">
                                                                    {cntPerbaikan} Perbaikan
                                                                </span>
                                                            )}
                                                            {cntRusak > 0 && (
                                                                <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/30 dark:text-rose-400">
                                                                    {cntRusak} Rusak
                                                                </span>
                                                            )}
                                                            {totalUnit === 0 && (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5">
                                                        {item.jadwal_berikutnya ? (
                                                            <div className="text-xs">
                                                                <span className="font-semibold text-primary block">
                                                                    {new Date(item.jadwal_berikutnya).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    Tiap {item.periode_bulan} bulan
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                    <td className="p-3.5 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="size-8">
                                                                    <MoreHorizontal size={15} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedKunjungan(item);
                                                                        setIsDetailOpen(true);
                                                                    }}
                                                                    className="gap-2 cursor-pointer"
                                                                >
                                                                    <Eye size={14} /> Lihat Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                                                                    <a
                                                                        href={route('kunjungan-maintenance.export-pdf', item.id)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <FileDown size={14} /> Cetak BAP (PDF)
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                                                                    <Link href={route('kunjungan-maintenance.edit', item.id)}>
                                                                        <Pencil size={14} /> Edit Kunjungan
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setPendingDelete(item)}
                                                                    className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                                                                >
                                                                    <Trash2 size={14} /> Hapus Kunjungan
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {kunjunganPaginated.data.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                                    Belum ada rekam kunjungan maintenance yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Links */}
                            {kunjunganPaginated.total > kunjunganPaginated.per_page && (
                                <div className="flex items-center justify-between border-t p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan {kunjunganPaginated.from || 0} - {kunjunganPaginated.to || 0} dari {kunjunganPaginated.total} data
                                    </p>
                                    <div className="flex gap-1">
                                        {kunjunganPaginated.links.map((link, idx) => (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className="h-8 min-w-8 text-xs"
                                            >
                                                {link.url ? (
                                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab 2 Content: Monitoring Jadwal Kunjungan Berkala (3/6 Bulan) */}
                {currentTab === 'jadwal' && (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-muted/30 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        Status Kunjungan Berkala Lokasi Pelanggan
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Pengingat otomatis untuk melakukan kunjungan berkala setiap 3 atau 6 bulan sekali ke lokasi yang meminjam printer.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                                        <span className="size-2 rounded-full bg-rose-500"></span> Jatuh Tempo
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                        <span className="size-2 rounded-full bg-amber-500"></span> Segera (≤ 30 hr)
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <span className="size-2 rounded-full bg-emerald-500"></span> Aman
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                                        <tr>
                                            <th className="p-3.5">Lokasi Pelanggan</th>
                                            <th className="p-3.5 text-center">Unit Dipinjamkan</th>
                                            <th className="p-3.5">Kunjungan Terakhir</th>
                                            <th className="p-3.5">Interval & Target Berikutnya</th>
                                            <th className="p-3.5 text-center">Status Jatuh Tempo</th>
                                            <th className="p-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {jadwalMonitoring.map((item) => (
                                            <tr key={item.lokasi_id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-3.5">
                                                    <span className="font-semibold text-foreground block">
                                                        {item.lokasi_nama}
                                                    </span>
                                                    {item.lokasi_alamat && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {item.lokasi_alamat}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300">
                                                        <Printer size={12} /> {item.total_printer} Unit
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    {item.kunjungan_terakhir ? (
                                                        <div className="text-xs">
                                                            <span className="font-medium text-foreground block">
                                                                {new Date(item.kunjungan_terakhir).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Oleh {item.teknisi_terakhir || 'Teknisi'} ({item.nomor_kunjungan_terakhir})
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">
                                                            Belum pernah dicatat
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5">
                                                    {item.jadwal_berikutnya ? (
                                                        <div className="text-xs">
                                                            <span className="font-semibold text-primary block">
                                                                {new Date(item.jadwal_berikutnya).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Periode {item.periode_bulan} bulan
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    {getJatuhTempoBadge(item)}
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <Button asChild size="sm" className="gap-1.5 shadow-xs">
                                                        <Link
                                                            href={route('kunjungan-maintenance.create', {
                                                                lokasi_id: item.lokasi_id,
                                                            })}
                                                        >
                                                            <CalendarCheck size={14} /> Catat Kunjungan
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {jadwalMonitoring.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    Tidak ada data lokasi pelanggan yang meminjam printer.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail Kunjungan */}
            <KunjunganDetailModal
                kunjungan={selectedKunjungan}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            {/* Dialog Konfirmasi Hapus */}
            <ConfirmDeleteDialog
                open={!!pendingDelete}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Hapus Rekam Kunjungan Maintenance"
                description={`Apakah Anda yakin ingin menghapus kunjungan nomor ${pendingDelete?.nomor_kunjungan} di ${pendingDelete?.lokasi?.nama}? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AppLayout>
    );
}
