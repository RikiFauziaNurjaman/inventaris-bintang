import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Download, Printer, RotateCcw, ScanLine } from 'lucide-react';
import { useState } from 'react';

type ScanState = 'pending' | 'found' | 'wrong_location' | 'unexpected' | 'unknown';
type OpnameItem = {
    id: number;
    serial_number: string;
    state: ScanState;
    status_snapshot?: string | null;
    scanned_at?: string | null;
    model?: { nama: string; merek?: string | null; kategori?: string | null } | null;
    lokasi_sistem?: string | null;
    scanned_by?: { id: number; name: string } | null;
};
type LegacyDetail = {
    model_barang?: { kategori?: { nama: string }; merek?: { nama: string }; nama: string };
    jumlah_sistem: number;
    jumlah_fisik: number;
    selisih: number;
    serial_hilang: string;
    serial_baru: string;
    catatan?: string;
};
type Progress = {
    expected: number;
    found: number;
    pending: number;
    wrong_location: number;
    unexpected: number;
    unknown: number;
    percent: number;
    contributors: { id: number; name: string }[];
};
type Props = {
    data: {
        id: number;
        tanggal: string;
        lokasi: { nama: string };
        user: { id: number; name: string };
        user_id: number;
        status: 'active' | 'submitted' | 'approved' | 'cancelled';
        approved_at?: string | null;
        approved_by?: { name: string } | null;
        details: LegacyDetail[];
    };
    items?: {
        data: OpnameItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    } | null;
    progress?: Progress | null;
    filters?: { state?: string; search?: string };
};

const stateLabels: Record<ScanState, string> = {
    pending: 'Belum ditemukan',
    found: 'Ditemukan',
    wrong_location: 'Salah lokasi',
    unexpected: 'Tidak diharapkan',
    unknown: 'Tidak terdaftar',
};
const stateClasses: Record<ScanState, string> = {
    pending: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    found: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    wrong_location: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    unexpected: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
    unknown: 'border-destructive/30 bg-destructive/10 text-destructive',
};
const statusLabels = { active: 'Aktif', submitted: 'Menunggu review', approved: 'Disetujui', cancelled: 'Dibatalkan' };

export default function Show({ data, items, progress, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number }; permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const canManage = auth.user.id === data.user_id || permissions.includes(PERMISSIONS.EDIT_STOCK_OPNAME);
    const canApprove = permissions.includes(PERMISSIONS.APPROVE_STOCK_OPNAME);
    const canScan = canManage || permissions.includes(PERMISSIONS.PARTICIPATE_STOCK_OPNAME);
    const [approveOpen, setApproveOpen] = useState(false);
    const [reopenOpen, setReopenOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const columns: Column<OpnameItem>[] = [
        {
            header: 'Serial Number',
            accessorKey: 'serial_number',
            cell: (item) => <span className="font-mono text-xs font-medium">{item.serial_number}</span>,
        },
        {
            header: 'Model',
            cell: (item) => (item.model ? `${item.model.merek || ''} ${item.model.nama}`.trim() : '—'),
        },
        {
            header: 'Temuan',
            cell: (item) => (
                <Badge variant="outline" className={stateClasses[item.state]}>
                    {stateLabels[item.state]}
                </Badge>
            ),
        },
        { header: 'Status snapshot', cell: (item) => item.status_snapshot || '—' },
        { header: 'Lokasi sistem', cell: (item) => item.lokasi_sistem || data.lokasi.nama },
        { header: 'Petugas', cell: (item) => item.scanned_by?.name || '—' },
        {
            header: 'Waktu scan',
            cell: (item) => (item.scanned_at ? new Date(item.scanned_at).toLocaleString('id-ID') : '—'),
        },
    ];

    return (
        <StockPage
            title="Review Stock Opname"
            description="Hasil ini merupakan audit dan tidak mengubah data stok secara otomatis."
            actions={
                <div className="flex flex-wrap gap-2 print:hidden">
                    <Button asChild variant="outline">
                        <Link href={route('stock-opname.index')}>
                            <ArrowLeft />
                            Kembali
                        </Link>
                    </Button>
                    {items && (
                        <>
                            <Button asChild variant="outline">
                                <a href={route('stock-opname.export', data.id)}>
                                    <Download />
                                    Export CSV
                                </a>
                            </Button>
                            <Button type="button" variant="outline" onClick={() => window.print()}>
                                <Printer />
                                Cetak
                            </Button>
                        </>
                    )}
                    {data.status === 'active' && canScan && (
                        <Button asChild>
                            <Link href={route('stock-opname.scan', data.id)}>
                                <ScanLine />
                                Lanjut scan
                            </Link>
                        </Button>
                    )}
                    {data.status === 'submitted' && canManage && (
                        <Button type="button" variant="outline" onClick={() => setReopenOpen(true)}>
                            <RotateCcw />
                            Buka kembali
                        </Button>
                    )}
                    {data.status === 'submitted' && canApprove && (
                        <Button type="button" onClick={() => setApproveOpen(true)}>
                            <Check />
                            Setujui audit
                        </Button>
                    )}
                </div>
            }
        >
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Informasi stock opname">
                {[
                    ['Tanggal', data.tanggal],
                    ['Lokasi', data.lokasi?.nama || '—'],
                    ['Pembuat sesi', data.user?.name || '—'],
                    ['Status', statusLabels[data.status]],
                ].map(([label, value]) => (
                    <Card key={label}>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-1 font-semibold text-foreground">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {items && progress ? (
                <>
                    <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6" aria-label="Ringkasan hasil">
                        {[
                            ['Expected', progress.expected],
                            ['Ditemukan', progress.found],
                            ['Belum ditemukan', progress.pending],
                            ['Salah lokasi', progress.wrong_location],
                            ['Tidak diharapkan', progress.unexpected],
                            ['Tidak terdaftar', progress.unknown],
                        ].map(([label, value]) => (
                            <Card key={label}>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <DataTable
                        data={items.data}
                        columns={columns}
                        links={items.links}
                        paginationMeta={items}
                        initialSearch={filters?.search || ''}
                        searchPlaceholder="Cari serial number..."
                        onSearch={(search) =>
                            router.get(
                                route('stock-opname.show', data.id),
                                { search, state: filters?.state || undefined },
                                { preserveState: true, preserveScroll: true, replace: true },
                            )
                        }
                        customFilters={
                            <div className="flex items-center gap-2">
                                <label htmlFor="state-filter" className="text-sm font-medium">
                                    Temuan
                                </label>
                                <select
                                    id="state-filter"
                                    value={filters?.state || ''}
                                    onChange={(event) =>
                                        router.get(
                                            route('stock-opname.show', data.id),
                                            { state: event.target.value || undefined, search: filters?.search || undefined },
                                            { preserveState: true, preserveScroll: true, replace: true },
                                        )
                                    }
                                    className="min-w-52 px-3 text-sm"
                                >
                                    <option value="">Semua temuan</option>
                                    {Object.entries(stateLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        }
                    />
                </>
            ) : (
                <LegacyResults details={data.details} />
            )}

            <ConfirmDeleteDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Setujui audit stock opname?"
                description="Hasil akan dikunci permanen. Data barang dan rekap stok tidak akan diubah."
                confirmLabel="Setujui audit"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    setProcessing(true);
                    router.post(
                        route('stock-opname.approve', data.id),
                        {},
                        { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => setApproveOpen(false) },
                    );
                }}
            />
            <ConfirmDeleteDialog
                open={reopenOpen}
                onOpenChange={setReopenOpen}
                title="Buka kembali sesi?"
                description="Sesi kembali aktif dan seluruh peserta dapat melanjutkan scan."
                confirmLabel="Buka kembali"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    setProcessing(true);
                    router.post(
                        route('stock-opname.reopen', data.id),
                        {},
                        { onFinish: () => setProcessing(false), onSuccess: () => setReopenOpen(false) },
                    );
                }}
            />
        </StockPage>
    );
}

function LegacyResults({ details }: { details: LegacyDetail[] }) {
    const parse = (value: string): string[] => {
        try {
            const result: unknown = JSON.parse(value || '[]');
            return Array.isArray(result) ? result.filter((item): item is string => typeof item === 'string') : [];
        } catch {
            return [];
        }
    };

    return (
        <section className="overflow-x-auto rounded-xl border bg-card" aria-label="Hasil stock opname lama">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Sistem</TableHead>
                        <TableHead>Fisik</TableHead>
                        <TableHead>Selisih</TableHead>
                        <TableHead>Serial hilang</TableHead>
                        <TableHead>Serial baru</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {details.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="min-w-52 font-medium">
                                {item.model_barang
                                    ? `${item.model_barang.merek?.nama || ''} ${item.model_barang.nama}`.trim()
                                    : 'Model tidak ditemukan'}
                            </TableCell>
                            <TableCell>{item.jumlah_sistem}</TableCell>
                            <TableCell>{item.jumlah_fisik}</TableCell>
                            <TableCell>{item.selisih}</TableCell>
                            <TableCell className="font-mono text-xs">{parse(item.serial_hilang).join(', ') || '—'}</TableCell>
                            <TableCell className="font-mono text-xs">{parse(item.serial_baru).join(', ') || '—'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
    );
}
