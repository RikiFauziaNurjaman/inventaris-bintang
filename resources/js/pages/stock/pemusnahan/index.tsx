import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

type Pemusnahan = {
    id: number;
    kode_pemusnahaan: string;
    tanggal_pemusnahaan: string;
    alasan: string;
    status: 'pending' | 'approved' | 'rejected';
    user: { name: string };
    approver: { name: string } | null;
    barang: { serial_number: string }[];
};

type Props = {
    daftarPemusnahan: {
        data: Pemusnahan[];
        from: number | null;
        to: number | null;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    auth: { permissions?: string[] };
};

const statusLabel = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function IndexPemusnahan({ auth, daftarPemusnahan }: Props) {
    const canApprove = (auth.permissions ?? []).includes(PERMISSIONS.APPROVE_STOK_RUSAK);
    const [pendingApprove, setPendingApprove] = useState<Pemusnahan | null>(null);
    const [processing, setProcessing] = useState(false);
    const columns: Column<Pemusnahan>[] = [
        { header: 'Kode', accessorKey: 'kode_pemusnahaan', className: 'whitespace-nowrap' },
        { header: 'Tanggal', accessorKey: 'tanggal_pemusnahaan', className: 'whitespace-nowrap' },
        { header: 'Alasan', accessorKey: 'alasan' },
        { header: 'Pengaju', cell: (item) => item.user.name },
        { header: 'Jumlah Unit', cell: (item) => item.barang.length, className: 'text-center' },
        {
            header: 'Status',
            cell: (item) => (
                <Badge
                    variant={item.status === 'rejected' ? 'destructive' : item.status === 'approved' ? 'default' : 'secondary'}
                    className={item.status === 'approved' ? 'bg-emerald-600 text-white' : undefined}
                >
                    {statusLabel[item.status]}
                </Badge>
            ),
        },
    ];

    return (
        <StockPage
            title="Pengajuan Pemusnahan"
            description="Tinjau pengajuan pemusnahan unit rusak dan riwayat persetujuannya."
            actions={
                <Button asChild variant="outline">
                    <Link href={route('stock.rusak.index')}>
                        <ArrowLeft />
                        Kembali ke stok rusak
                    </Link>
                </Button>
            }
        >
            <DataTable
                data={daftarPemusnahan.data}
                columns={columns}
                links={daftarPemusnahan.links}
                paginationMeta={daftarPemusnahan}
                actionWidth="w-40"
                actions={(item) =>
                    canApprove && item.status === 'pending' ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
                            onClick={() => setPendingApprove(item)}
                            aria-label={`Setujui pemusnahan ${item.kode_pemusnahaan}`}
                        >
                            <Check />
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {item.status === 'approved' ? `Oleh ${item.approver?.name || '—'}` : '—'}
                        </span>
                    )
                }
            />

            <ConfirmDeleteDialog
                open={Boolean(pendingApprove)}
                onOpenChange={(open) => !open && setPendingApprove(null)}
                title="Setujui pemusnahan?"
                description={`Pemusnahan ${pendingApprove?.kode_pemusnahaan ?? ''} akan mengurangi stok secara permanen.`}
                confirmLabel="Setujui"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    if (!pendingApprove) return;
                    setProcessing(true);
                    router.post(
                        route('stock.rusak.pemusnahan.approve', pendingApprove.id),
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
