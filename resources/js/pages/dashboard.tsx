import StokPerLokasiChart from '@/components/chart/stok-perlokasi-chart';
import StokSummaryChart from '@/components/chart/stok-summary-chart';
import FastSearch from '@/components/dashboard/fast-search';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PERMISSIONS } from '@/constants/permission';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowRight,
    ArrowUpFromLine,
    Boxes,
    PackageCheck,
    PackagePlus,
    Search,
    ShoppingCart,
    TriangleAlert,
    Truck,
    Undo2,
    Warehouse,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

type StockSummary = {
    total: number;
    gudang: number;
    distribusi: number;
    tersedia: number;
    terjual: number;
    rusak: number;
    perbaikan: number;
};

type Activity = {
    tanggal: string;
    keterangan: string;
    jumlah: number;
};

type DashboardProps = {
    auth: { permissions?: string[] };
    stokSummary: StockSummary;
    transactionSummary: { masuk: number; keluar: number; kembali: number; periode: string };
    stokKritis?: { nama: string; lokasi: string; tersedia: number }[];
    latestMasuk?: Activity[];
    latestKeluar?: Activity[];
    latestKembali?: Activity[];
    stokPerLokasi?: { lokasi: string; tersedia: number; rusak: number; perbaikan: number; total: number }[];
    stokBaruSecondGudang: { baru: number; second: number };
    totalKategori: number;
    totalJenisBarang: number;
};

type MetricConfig = {
    key: keyof StockSummary;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone: string;
    permission: string;
};

const stockMetrics: MetricConfig[] = [
    {
        key: 'total',
        title: 'Ringkasan Stok',
        description: 'Rekap seluruh inventaris',
        href: '/total-stock',
        icon: Boxes,
        tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
        permission: PERMISSIONS.VIEW_STOK_TOTAL,
    },
    {
        key: 'gudang',
        title: 'Stok Gudang',
        description: 'Tersedia di gudang',
        href: '/stok-gudang',
        icon: Warehouse,
        tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        permission: PERMISSIONS.VIEW_STOK_GUDANG,
    },
    {
        key: 'distribusi',
        title: 'Stok Distribusi',
        description: 'Berada di lokasi distribusi',
        href: '/stok-distribusi',
        icon: Truck,
        tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        permission: PERMISSIONS.VIEW_STOK_DISTRIBUSI,
    },
    {
        key: 'terjual',
        title: 'Terjual',
        description: 'Barang selesai dijual',
        href: '/stok-terjual',
        icon: ShoppingCart,
        tone: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
        permission: PERMISSIONS.VIEW_STOK_TERJUAL,
    },
    {
        key: 'rusak',
        title: 'Stok Rusak',
        description: 'Menunggu tindak lanjut',
        href: '/stock-rusak',
        icon: TriangleAlert,
        tone: 'bg-red-500/10 text-red-700 dark:text-red-400',
        permission: PERMISSIONS.VIEW_STOK_RUSAK,
    },
    {
        key: 'perbaikan',
        title: 'Dalam Perbaikan',
        description: 'Sedang ditangani',
        href: '/perbaikan',
        icon: Wrench,
        tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        permission: PERMISSIONS.VIEW_STOK_DIPERBAIKI,
    },
];

const transactionMetrics = [
    {
        key: 'masuk' as const,
        title: 'Barang Masuk',
        description: 'Unit diterima bulan ini',
        href: '/barang-masuk',
        icon: PackagePlus,
        tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        permission: PERMISSIONS.VIEW_BARANG_MASUK,
    },
    {
        key: 'keluar' as const,
        title: 'Barang Keluar',
        description: 'Unit didistribusikan bulan ini',
        href: '/barang-keluar',
        icon: ArrowUpFromLine,
        tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        permission: PERMISSIONS.VIEW_BARANG_KELUAR,
    },
    {
        key: 'kembali' as const,
        title: 'Barang Kembali',
        description: 'Unit dikembalikan bulan ini',
        href: '/barang-kembali',
        icon: ArrowDownToLine,
        tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        permission: PERMISSIONS.VIEW_BARANG_KEMBALI,
    },
];

const number = (value: number) => value.toLocaleString('id-ID');
const date = (value: string) =>
    new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));

export default function Dashboard() {
    const {
        auth,
        stokSummary,
        transactionSummary,
        stokKritis = [],
        latestMasuk = [],
        latestKeluar = [],
        latestKembali = [],
        stokPerLokasi = [],
        stokBaruSecondGudang,
        totalKategori,
        totalJenisBarang,
    } = usePage<DashboardProps>().props;
    const permissions = auth.permissions ?? [];
    const visibleStockMetrics = stockMetrics.filter((item) => permissions.includes(item.permission));
    const visibleTransactionMetrics = transactionMetrics.filter((item) => permissions.includes(item.permission));
    const activities = [
        ...latestMasuk.map((item) => ({ ...item, type: 'Barang Masuk', href: '/barang-masuk', icon: PackagePlus })),
        ...latestKeluar.map((item) => ({ ...item, type: 'Barang Keluar', href: '/barang-keluar', icon: Truck })),
        ...latestKembali.map((item) => ({ ...item, type: 'Barang Kembali', href: '/barang-kembali', icon: Undo2 })),
    ]
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
        .slice(0, 8);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <header>
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Overview</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Dashboard Inventaris</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Pantau posisi stok, aktivitas transaksi, dan kondisi inventaris dari satu halaman.
                    </p>
                </header>

                <Card className="gap-4 py-4 shadow-none">
                    <CardContent className="flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Search className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Pencarian cepat barang</p>
                                <p className="text-xs text-muted-foreground">Cari berdasarkan serial number, merek, atau model.</p>
                            </div>
                        </div>
                        <div className="w-full lg:max-w-xl">
                            <FastSearch />
                        </div>
                    </CardContent>
                </Card>

                {visibleStockMetrics.length > 0 && (
                    <section aria-labelledby="stock-summary-heading" className="space-y-3">
                        <div>
                            <h2 id="stock-summary-heading" className="text-base font-semibold text-foreground">
                                Ringkasan Stok
                            </h2>
                            <p className="text-sm text-muted-foreground">Posisi inventaris terkini di seluruh lokasi.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                            {visibleStockMetrics.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <Card className="h-full gap-4 py-5 shadow-none transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                                            <CardContent className="px-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className={cn('flex size-10 items-center justify-center rounded-lg', item.tone)}>
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                                </div>
                                                <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
                                                    {number(stokSummary[item.key])}
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {visibleTransactionMetrics.length > 0 && (
                    <section aria-labelledby="transaction-summary-heading" className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 id="transaction-summary-heading" className="text-base font-semibold text-foreground">
                                    Transaksi Bulan Ini
                                </h2>
                                <p className="text-sm text-muted-foreground">Jumlah unit yang diproses selama {transactionSummary.periode}.</p>
                            </div>
                            <Badge variant="outline">{transactionSummary.periode}</Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            {visibleTransactionMetrics.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <Card className="h-full gap-0 py-0 shadow-none transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                                            <CardContent className="flex items-center gap-4 p-5">
                                                <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', item.tone)}>
                                                    <Icon className="size-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                                                        {number(transactionSummary[item.key])}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                                                </div>
                                                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="gap-4 shadow-none">
                        <CardHeader>
                            <CardTitle>Komposisi Stok</CardTitle>
                            <CardDescription>Perbandingan barang tersedia, rusak, dan dalam perbaikan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StokSummaryChart data={stokSummary} />
                            <dl className="grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-4">
                                {[
                                    ['Barang Baru', stokBaruSecondGudang.baru],
                                    ['Barang Second', stokBaruSecondGudang.second],
                                    ['Kategori', totalKategori],
                                    ['Jenis Barang', totalJenisBarang],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-lg bg-muted/60 px-3 py-2">
                                        <dt className="text-xs text-muted-foreground">{label}</dt>
                                        <dd className="mt-1 font-semibold text-foreground">{number(Number(value))}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="gap-4 shadow-none">
                        <CardHeader>
                            <CardTitle>Stok per Lokasi Distribusi</CardTitle>
                            <CardDescription>Jumlah unit berdasarkan kondisi di setiap lokasi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stokPerLokasi.length > 0 ? (
                                <StokPerLokasiChart data={stokPerLokasi} />
                            ) : (
                                <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                    Belum ada stok di lokasi distribusi.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                    <Card className="gap-0 py-0 shadow-none">
                        <CardHeader className="border-b py-5">
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <CardDescription>Pergerakan barang masuk, keluar, dan kembali yang paling baru.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            {activities.length > 0 ? (
                                <div className="divide-y">
                                    {activities.map((item, index) => {
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={`${item.type}-${item.tanggal}-${index}`}
                                                href={item.href}
                                                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none"
                                            >
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">{item.keterangan}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.type} · {date(item.tanggal)}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">{number(item.jumlah)} unit</Badge>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">Belum ada aktivitas transaksi.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0 shadow-none">
                        <CardHeader className="border-b py-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Stok Kritis</CardTitle>
                                    <CardDescription>Model dengan stok gudang di bawah 10 unit.</CardDescription>
                                </div>
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                    <TriangleAlert className="size-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            {stokKritis.length > 0 ? (
                                <div className="divide-y">
                                    {stokKritis.map((item, index) => (
                                        <div key={`${item.nama}-${item.lokasi}-${index}`} className="flex items-center gap-3 px-5 py-3">
                                            <PackageCheck className="size-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{item.nama}</p>
                                                <p className="truncate text-xs text-muted-foreground">{item.lokasi}</p>
                                            </div>
                                            <Badge variant={item.tersedia === 0 ? 'destructive' : 'outline'}>{number(item.tersedia)} unit</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">Tidak ada stok kritis.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
