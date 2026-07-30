import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { TransactionFilterField, TransactionPage } from '@/components/transaction-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permission';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit3, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import BarangKembaliDetailModal from './BarangKembaliDetail';

type NamedOption = { id: number; nama: string };
type BarangKembali = {
    id: number;
    tanggal: string;
    lokasi?: NamedOption;
    details: {
        id: number;
        status_saat_kembali: string;
        barang?: {
            model_barang?: {
                nama: string;
                merek?: NamedOption;
                kategori?: NamedOption;
            };
        };
    }[];
};
type Filters = {
    tanggal: string;
    kategori_id: string;
    lokasi_id: string;
    search: string;
    sort: string;
    per_page: string | number;
};
type PageProps = {
    auth: { permissions?: string[] };
    filters?: Partial<Filters>;
    barangKembali: {
        data: BarangKembali[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    kategoriOptions: NamedOption[];
    lokasiOptions: NamedOption[];
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function ConditionBadge({ value }: { value?: string }) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground',
                value === 'bagus' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                value === 'rusak' && 'bg-destructive/10 text-destructive',
                value === 'diperbaiki' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
            )}
        >
            {value === 'bagus' ? 'Baik' : value === 'diperbaiki' ? 'Diperbaiki' : value || '—'}
        </span>
    );
}

export default function BarangKembaliIndex() {
    const { auth, filters = {}, barangKembali, kategoriOptions, lokasiOptions } = usePage<PageProps>().props;
    const permissions = auth.permissions ?? [];
    const [selectedItem, setSelectedItem] = useState<unknown>(null);
    const [pendingDelete, setPendingDelete] = useState<BarangKembali | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [filterData, setFilterData] = useState<Filters>({
        tanggal: filters.tanggal ?? '',
        kategori_id: filters.kategori_id ?? '',
        lokasi_id: filters.lokasi_id ?? '',
        search: filters.search ?? '',
        sort: filters.sort ?? 'terbaru',
        per_page: filters.per_page ?? 10,
    });

    const visit = (next: Filters) => {
        router.get(route('barang-kembali.index'), next, { preserveState: true, preserveScroll: true, replace: true });
    };
    const search = useDebouncedCallback((value: string) => visit({ ...filterData, search: value }));

    const updateFilter = (key: keyof Filters, value: string) => {
        const next = { ...filterData, [key]: value };
        setFilterData(next);
        visit(next);
    };

    const resetFilters = () => {
        const reset: Filters = {
            tanggal: '',
            kategori_id: '',
            lokasi_id: '',
            search: '',
            sort: 'terbaru',
            per_page: 10,
        };
        setFilterData(reset);
        visit(reset);
    };

    const openDetail = async (item: BarangKembali) => {
        try {
            const response = await fetch(route('barang-kembali.show', item.id), { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as { barangKembali: unknown };
            setSelectedItem(payload.barangKembali);
        } catch {
            toast.error('Detail barang kembali gagal dimuat.');
        }
    };

    const columns: Column<BarangKembali>[] = [
        { header: 'Tanggal', accessorKey: 'tanggal', className: 'w-36 whitespace-nowrap' },
        {
            header: 'Merek & Model',
            cell: (item) => {
                const model = item.details[0]?.barang?.model_barang;
                return (
                    <div>
                        <p className="font-medium">{[model?.merek?.nama, model?.nama].filter(Boolean).join(' ') || '—'}</p>
                        <p className="text-xs text-muted-foreground">
                            {item.details.length > 1 ? `${item.details.length} unit` : model?.kategori?.nama || 'Tanpa kategori'}
                        </p>
                    </div>
                );
            },
        },
        { header: 'Kategori', cell: (item) => item.details[0]?.barang?.model_barang?.kategori?.nama || '—' },
        { header: 'Asal Lokasi', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Kondisi', cell: (item) => <ConditionBadge value={item.details[0]?.status_saat_kembali} /> },
    ];

    return (
        <TransactionPage title="Barang Kembali" description="Kelola pengembalian unit beserta kondisi aktual setelah digunakan.">
            <DataTable
                data={barangKembali.data}
                columns={columns}
                links={barangKembali.links}
                paginationMeta={barangKembali}
                initialSearch={filterData.search}
                searchPlaceholder="Cari serial, merek, atau model..."
                onSearch={(value) => {
                    setFilterData((current) => ({ ...current, search: value }));
                    search(value);
                }}
                onCreate={permissions.includes(PERMISSIONS.CREATE_BARANG_KEMBALI) ? () => router.visit(route('barang-kembali.create')) : undefined}
                createLabel="Tambah barang kembali"
                customFilters={
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                        <TransactionFilterField label="Tanggal">
                            <Input type="date" value={filterData.tanggal} onChange={(event) => updateFilter('tanggal', event.target.value)} />
                        </TransactionFilterField>
                        <TransactionFilterField label="Kategori">
                            <select
                                value={filterData.kategori_id}
                                onChange={(event) => updateFilter('kategori_id', event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Semua kategori</option>
                                {kategoriOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.nama}
                                    </option>
                                ))}
                            </select>
                        </TransactionFilterField>
                        <TransactionFilterField label="Lokasi asal">
                            <select
                                value={filterData.lokasi_id}
                                onChange={(event) => updateFilter('lokasi_id', event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Semua lokasi</option>
                                {lokasiOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.nama}
                                    </option>
                                ))}
                            </select>
                        </TransactionFilterField>
                        <TransactionFilterField label="Urutkan">
                            <select value={filterData.sort} onChange={(event) => updateFilter('sort', event.target.value)} className={selectClass}>
                                <option value="terbaru">Terbaru</option>
                                <option value="terlama">Terlama</option>
                            </select>
                        </TransactionFilterField>
                        <TransactionFilterField label="Per halaman">
                            <select
                                value={filterData.per_page}
                                onChange={(event) => updateFilter('per_page', event.target.value)}
                                className={selectClass}
                            >
                                <option value="10">10 data</option>
                                <option value="25">25 data</option>
                                <option value="50">50 data</option>
                                <option value="100">100 data</option>
                            </select>
                        </TransactionFilterField>
                        <Button type="button" variant="outline" onClick={resetFilters} className="self-end">
                            <RotateCcw />
                            Reset filter
                        </Button>
                    </div>
                }
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => openDetail(item)} aria-label={`Lihat transaksi ${item.id}`}>
                            <Eye />
                        </Button>
                        {permissions.includes(PERMISSIONS.EDIT_BARANG_KEMBALI) && (
                            <Button asChild variant="ghost" size="icon">
                                <Link href={route('barang-kembali.edit', item.id)} aria-label={`Edit transaksi ${item.id}`}>
                                    <Edit3 />
                                </Link>
                            </Button>
                        )}
                        {permissions.includes(PERMISSIONS.DELETE_BARANG_KEMBALI) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(item)}
                                aria-label={`Hapus transaksi ${item.id}`}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                )}
            />

            <BarangKembaliDetailModal show={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} barangKembali={selectedItem} />
            <ConfirmDeleteDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                description="Transaksi pengembalian dan dampak stok terkait akan dihapus sesuai aturan sistem."
                processing={deleting}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    setDeleting(true);
                    router.delete(route('barang-kembali.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onFinish: () => setDeleting(false),
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </TransactionPage>
    );
}
