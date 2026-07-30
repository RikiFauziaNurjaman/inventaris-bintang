import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { TransactionFilterField, TransactionPage } from '@/components/transaction-page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permission';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit3, Eye, FileText, MoreHorizontal, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import BarangKeluarDetailModal from './BarangKeluarDetail';

type NamedOption = { id: number; nama: string };
type BarangKeluar = {
    id: number;
    tanggal: string;
    lokasi?: NamedOption;
    details: {
        id: number;
        status_keluar?: string;
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
    barangKeluar: {
        data: BarangKeluar[];
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

function StatusBadge({ value }: { value?: string }) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground',
                value === 'dipinjamkan' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                value === 'dijual' && 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
                value === 'maintenance' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
            )}
        >
            {value === 'dipinjamkan' ? 'Dipinjamkan' : value === 'dijual' ? 'Dijual' : value === 'maintenance' ? 'Maintenance' : value || '—'}
        </span>
    );
}

export default function BarangKeluarIndex() {
    const { auth, filters = {}, barangKeluar, kategoriOptions, lokasiOptions } = usePage<PageProps>().props;
    const permissions = auth.permissions ?? [];
    const [selectedItem, setSelectedItem] = useState<unknown>(null);
    const [pendingDelete, setPendingDelete] = useState<BarangKeluar | null>(null);
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
        router.get(route('barang-keluar.index'), next, { preserveState: true, preserveScroll: true, replace: true });
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

    const openDetail = async (item: BarangKeluar) => {
        try {
            const response = await fetch(route('barang-keluar.show', item.id), { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as { barangKeluar: unknown };
            setSelectedItem(payload.barangKeluar);
        } catch {
            toast.error('Detail barang keluar gagal dimuat.');
        }
    };

    const columns: Column<BarangKeluar>[] = [
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
        { header: 'Tujuan', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Status', cell: (item) => <StatusBadge value={item.details[0]?.status_keluar} /> },
    ];

    return (
        <TransactionPage title="Barang Keluar" description="Kelola distribusi, peminjaman, penjualan, dan dokumen barang keluar.">
            <DataTable
                data={barangKeluar.data}
                columns={columns}
                links={barangKeluar.links}
                paginationMeta={barangKeluar}
                initialSearch={filterData.search}
                searchPlaceholder="Cari serial, merek, atau model..."
                onSearch={(value) => {
                    setFilterData((current) => ({ ...current, search: value }));
                    search(value);
                }}
                onCreate={permissions.includes(PERMISSIONS.CREATE_BARANG_KELUAR) ? () => router.visit(route('barang-keluar.create')) : undefined}
                createLabel="Tambah barang keluar"
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
                        <TransactionFilterField label="Lokasi tujuan">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Aksi transaksi ${item.id}`}>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => openDetail(item)}>
                                <Eye />
                                Lihat detail
                            </DropdownMenuItem>
                            {permissions.includes(PERMISSIONS.EDIT_BARANG_KELUAR) && (
                                <DropdownMenuItem asChild>
                                    <Link href={route('barang-keluar.edit', item.id)}>
                                        <Edit3 />
                                        Edit transaksi
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href={route('barang-keluar.cetak-surat', item.id)} target="_blank" rel="noreferrer">
                                    <FileText />
                                    Cetak surat
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={route('barang-keluar.cetak-label', item.id)} target="_blank" rel="noreferrer">
                                    <Printer />
                                    Cetak label
                                </a>
                            </DropdownMenuItem>
                            {permissions.includes(PERMISSIONS.DELETE_BARANG_KELUAR) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onSelect={() => setPendingDelete(item)}>
                                        <Trash2 />
                                        Hapus transaksi
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            <BarangKeluarDetailModal show={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} barangKeluar={selectedItem} />
            <ConfirmDeleteDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                description="Transaksi barang keluar dan dampak stok terkait akan dihapus sesuai aturan sistem."
                processing={deleting}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    setDeleting(true);
                    router.delete(route('barang-keluar.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onFinish: () => setDeleting(false),
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </TransactionPage>
    );
}
