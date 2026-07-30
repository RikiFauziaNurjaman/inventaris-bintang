import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import { Check, Eye, ScanLine } from 'lucide-react';
import { useState } from 'react';

type OpnameStatus = 'active' | 'submitted' | 'approved' | 'cancelled';
type StockOpname = {
    id: number;
    tanggal: string;
    lokasi?: { id: number; nama: string };
    user?: { id: number; name: string };
    user_id: number;
    catatan: string | null;
    status: OpnameStatus;
};
type Props = {
    data: {
        data: StockOpname[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters?: { status?: string; search?: string };
};

const statuses: Record<OpnameStatus, { label: string; className: string }> = {
    active: { label: 'Aktif', className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    submitted: { label: 'Menunggu review', className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    approved: { label: 'Disetujui', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    cancelled: { label: 'Dibatalkan', className: 'border-muted-foreground/30 bg-muted text-muted-foreground' },
};
const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export default function StockOpnameIndex({ data, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number }; permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const canReview = permissions.includes(PERMISSIONS.VIEW_STOCK_OPNAME);
    const [pendingApprove, setPendingApprove] = useState<StockOpname | null>(null);
    const [processing, setProcessing] = useState(false);
    const columns: Column<StockOpname>[] = [
        { header: 'Tanggal', cell: (item) => formatDate(item.tanggal), className: 'w-40 whitespace-nowrap' },
        { header: 'Lokasi', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Pembuat', cell: (item) => item.user?.name || '—' },
        { header: 'Catatan', accessorKey: 'catatan', cell: (item) => item.catatan || '—' },
        {
            header: 'Status',
            cell: (item) => (
                <Badge variant="outline" className={statuses[item.status].className}>
                    {statuses[item.status].label}
                </Badge>
            ),
        },
    ];

    return (
        <StockPage title="Stock Opname" description="Pemeriksaan stok fisik kolaboratif dengan audit serial yang aman.">
            <DataTable
                data={data.data}
                columns={columns}
                links={data.links}
                paginationMeta={data}
                onCreate={permissions.includes(PERMISSIONS.CREATE_STOCK_OPNAME) ? () => router.visit(route('stock-opname.create')) : undefined}
                createLabel="Mulai stock opname"
                initialSearch={filters?.search || ''}
                searchPlaceholder="Cari lokasi, pembuat, atau catatan..."
                onSearch={(search) =>
                    router.get(
                        route('stock-opname.index'),
                        { search, status: filters?.status || undefined },
                        { preserveState: true, preserveScroll: true, replace: true },
                    )
                }
                customFilters={
                    canReview ? (
                        <div className="flex items-center gap-2">
                            <label htmlFor="status-opname" className="text-sm font-medium">
                                Status
                            </label>
                            <select
                                id="status-opname"
                                value={filters?.status || ''}
                                onChange={(event) =>
                                    router.get(
                                        route('stock-opname.index'),
                                        { status: event.target.value || undefined },
                                        { preserveState: true, preserveScroll: true, replace: true },
                                    )
                                }
                                className="min-w-48 px-3 text-sm"
                            >
                                <option value="">Semua status</option>
                                {Object.entries(statuses).map(([value, status]) => (
                                    <option key={value} value={value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Menampilkan sesi aktif yang dapat Anda ikuti.</p>
                    )
                }
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {item.status === 'active' &&
                            (item.user_id === auth.user.id ||
                                permissions.includes(PERMISSIONS.PARTICIPATE_STOCK_OPNAME) ||
                                permissions.includes(PERMISSIONS.EDIT_STOCK_OPNAME)) && (
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={route('stock-opname.scan', item.id)} aria-label={`Masuk sesi opname ${item.id}`}>
                                        <ScanLine />
                                    </Link>
                                </Button>
                            )}
                        {canReview && (
                            <Button asChild variant="ghost" size="icon">
                                <Link href={route('stock-opname.show', item.id)} aria-label={`Lihat stock opname ${item.id}`}>
                                    <Eye />
                                </Link>
                            </Button>
                        )}
                        {item.status === 'submitted' && permissions.includes(PERMISSIONS.APPROVE_STOCK_OPNAME) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
                                onClick={() => setPendingApprove(item)}
                                aria-label={`Setujui stock opname ${item.id}`}
                            >
                                <Check />
                            </Button>
                        )}
                    </div>
                )}
            />

            <ConfirmDeleteDialog
                open={Boolean(pendingApprove)}
                onOpenChange={(open) => !open && setPendingApprove(null)}
                title="Setujui audit stock opname?"
                description="Approval mengunci hasil audit dan tidak mengubah data barang maupun rekap stok."
                confirmLabel="Setujui audit"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    if (!pendingApprove) return;
                    setProcessing(true);
                    router.post(
                        route('stock-opname.approve', pendingApprove.id),
                        {},
                        {
                            preserveScroll: true,
                            onFinish: () => setProcessing(false),
                            onSuccess: () => setPendingApprove(null),
                        },
                    );
                }}
            />
        </StockPage>
    );
}
