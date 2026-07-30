import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

type StockOpnameDetail = {
    model_barang?: {
        kategori?: { nama: string };
        merek?: { nama: string };
        nama: string;
    };
    jumlah_sistem: number;
    jumlah_fisik: number;
    selisih: number;
    serial_hilang: string;
    serial_baru: string;
    catatan?: string;
};

type Props = {
    data: {
        id: number;
        tanggal: string;
        lokasi: { nama: string };
        user: { name: string };
        approved_at?: string | null;
        details: StockOpnameDetail[];
    };
};

const parseSerials = (input: string): string[] => {
    try {
        const parsed: unknown = JSON.parse(input);
        return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
    } catch {
        return [];
    }
};

export default function Show({ data }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const canApprove = (auth.permissions ?? []).includes(PERMISSIONS.EDIT_STOCK_OPNAME);
    const [approveOpen, setApproveOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const isApproved = Boolean(data.approved_at);

    return (
        <StockPage
            title="Review Stock Opname"
            description="Periksa selisih jumlah dan serial sebelum hasil opname diterapkan ke stok."
            actions={
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={route('stock-opname.index')}>
                            <ArrowLeft />
                            Kembali
                        </Link>
                    </Button>
                    {!isApproved && canApprove && (
                        <Button type="button" onClick={() => setApproveOpen(true)}>
                            <Check />
                            Setujui opname
                        </Button>
                    )}
                </div>
            }
        >
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Informasi stock opname">
                {[
                    ['Tanggal', data.tanggal],
                    ['Lokasi', data.lokasi?.nama || '—'],
                    ['Petugas', data.user?.name || '—'],
                ].map(([label, value]) => (
                    <Card key={label}>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-1 font-semibold text-foreground">{value}</p>
                        </CardContent>
                    </Card>
                ))}
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <Badge className={`mt-2 ${isApproved ? 'bg-emerald-600 text-white' : ''}`} variant={isApproved ? 'default' : 'secondary'}>
                            {isApproved ? 'Disetujui' : 'Menunggu persetujuan'}
                        </Badge>
                        {data.approved_at && <p className="mt-2 text-xs text-muted-foreground">{data.approved_at}</p>}
                    </CardContent>
                </Card>
            </section>

            <section className="overflow-hidden rounded-xl border bg-card shadow-xs" aria-label="Hasil stock opname">
                <Table>
                    <TableHeader className="bg-muted/60">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Model</TableHead>
                            <TableHead className="text-center">Sistem</TableHead>
                            <TableHead className="text-center">Fisik</TableHead>
                            <TableHead className="text-center">Selisih</TableHead>
                            <TableHead>Serial Hilang</TableHead>
                            <TableHead>Serial Baru</TableHead>
                            <TableHead>Catatan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.details.map((item, index) => {
                            const serialHilang = parseSerials(item.serial_hilang);
                            const serialBaru = parseSerials(item.serial_baru);
                            return (
                                <TableRow key={index}>
                                    <TableCell className="min-w-56 font-medium">
                                        {item.model_barang
                                            ? `${item.model_barang.kategori?.nama || 'Tanpa kategori'} · ${item.model_barang.merek?.nama || 'Tanpa merek'} · ${item.model_barang.nama}`
                                            : 'Model tidak ditemukan'}
                                    </TableCell>
                                    <TableCell className="text-center">{item.jumlah_sistem}</TableCell>
                                    <TableCell className="text-center">{item.jumlah_fisik}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={
                                                item.selisih < 0
                                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                                    : item.selisih > 0
                                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                            }
                                        >
                                            {item.selisih > 0 ? '+' : ''}
                                            {item.selisih}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <SerialList serials={serialHilang} tone="danger" />
                                    </TableCell>
                                    <TableCell>
                                        <SerialList serials={serialBaru} tone="success" />
                                    </TableCell>
                                    <TableCell className="min-w-40 text-muted-foreground">{item.catatan || '—'}</TableCell>
                                </TableRow>
                            );
                        })}
                        {!data.details.length && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                    Tidak ada detail stock opname.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </section>

            <ConfirmDeleteDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Setujui stock opname?"
                description="Selisih pada hasil pemeriksaan ini akan diterapkan ke data stok."
                confirmLabel="Setujui"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    setProcessing(true);
                    router.post(
                        `/stock-opname/${data.id}/approve`,
                        {},
                        {
                            preserveScroll: true,
                            onFinish: () => setProcessing(false),
                            onSuccess: () => setApproveOpen(false),
                        },
                    );
                }}
            />
        </StockPage>
    );
}

function SerialList({ serials, tone }: { serials: string[]; tone: 'danger' | 'success' }) {
    if (!serials.length) return <span className="text-muted-foreground">—</span>;
    return (
        <div className="flex min-w-32 flex-col gap-1.5">
            {serials.map((serial) => (
                <span
                    key={serial}
                    className={`w-fit rounded-md px-2 py-1 font-mono text-xs ${
                        tone === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    }`}
                >
                    {serial}
                </span>
            ))}
        </div>
    );
}
