import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import { Check, Eye } from 'lucide-react';
import { useState } from 'react';

type StockOpname = {
    id: number;
    tanggal: string;
    lokasi?: { id: number; nama: string };
    user?: { id: number; name: string };
    catatan: string | null;
    approved_at?: string | null;
};
type Props = {
    data: {
        data: StockOpname[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
};

export default function StockOpnameIndex({ data }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [pendingApprove, setPendingApprove] = useState<StockOpname | null>(null);
    const [processing, setProcessing] = useState(false);
    const columns: Column<StockOpname>[] = [
        { header: 'Tanggal', accessorKey: 'tanggal', className: 'w-36 whitespace-nowrap' },
        { header: 'Lokasi', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Petugas', cell: (item) => item.user?.name || '—' },
        { header: 'Catatan', accessorKey: 'catatan', cell: (item) => item.catatan || '—' },
        {
            header: 'Status',
            cell: (item) => (
                <Badge className={item.approved_at ? 'bg-emerald-600 text-white' : undefined} variant={item.approved_at ? 'default' : 'secondary'}>
                    {item.approved_at ? 'Disetujui' : 'Menunggu'}
                </Badge>
            ),
        },
    ];

    return (
        <StockPage title="Stock Opname" description="Periksa kesesuaian stok fisik terhadap catatan sistem.">
            <DataTable
                data={data.data}
                columns={columns}
                links={data.links}
                paginationMeta={data}
                onCreate={permissions.includes(PERMISSIONS.CREATE_STOCK_OPNAME) ? () => router.visit(route('stock-opname.create')) : undefined}
                createLabel="Tambah stock opname"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={route('stock-opname.show', item.id)} aria-label={`Lihat stock opname ${item.id}`}>
                                <Eye />
                            </Link>
                        </Button>
                        {permissions.includes(PERMISSIONS.EDIT_STOCK_OPNAME) && !item.approved_at && (
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
                title="Setujui stock opname?"
                description="Hasil stock opname akan diterapkan pada data stok setelah disetujui."
                confirmLabel="Setujui"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    if (!pendingApprove) return;
                    setProcessing(true);
                    router.post(
                        `/stock-opname/${pendingApprove.id}/approve`,
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
