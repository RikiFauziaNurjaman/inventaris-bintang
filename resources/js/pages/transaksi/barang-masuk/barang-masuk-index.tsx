import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { TransactionFilterField, TransactionPage } from '@/components/transaction-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permission';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit3, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DetailBarangMasukModal from './barang-masuk-detail';

type NamedOption = { id: number; nama: string };
type BarangMasukItem = {
    id: number;
    merek?: string;
    model?: string;
    kategori?: string;
    asal_barang?: string;
    tanggal?: string;
};
type Filters = {
    tanggal: string;
    kategori_id: string;
    asal_barang_id: string;
    merek: string;
    search: string;
    sort_by: string;
    per_page: string | number;
};
type PageProps = {
    auth: { permissions?: string[] };
    filters?: Partial<Filters>;
    barangMasuk: {
        data: BarangMasukItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    kategoriOptions: NamedOption[];
    asalOptions: NamedOption[];
    merekOptions: NamedOption[];
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function BarangMasukIndex() {
    const { auth, filters = {}, barangMasuk, kategoriOptions, asalOptions, merekOptions } = usePage<PageProps>().props;
    const permissions = auth.permissions ?? [];
    const [selectedBarang, setSelectedBarang] = useState<unknown>(null);
    const [pendingDelete, setPendingDelete] = useState<BarangMasukItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [filterData, setFilterData] = useState<Filters>({
        tanggal: filters.tanggal ?? '',
        kategori_id: filters.kategori_id ?? '',
        asal_barang_id: filters.asal_barang_id ?? '',
        merek: filters.merek ?? '',
        search: filters.search ?? '',
        sort_by: filters.sort_by ?? 'desc',
        per_page: filters.per_page ?? 10,
    });

    const visit = (next: Filters) => {
        router.get(route('barang-masuk.index'), next, { preserveState: true, preserveScroll: true, replace: true });
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
            asal_barang_id: '',
            merek: '',
            search: '',
            sort_by: 'desc',
            per_page: 10,
        };
        setFilterData(reset);
        visit(reset);
    };

    const openDetail = async (item: BarangMasukItem) => {
        try {
            const response = await fetch(route('barang-masuk.show', item.id), { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error();
            const payload = (await response.json()) as { barangMasuk: unknown };
            setSelectedBarang(payload.barangMasuk);
        } catch {
            toast.error('Detail barang masuk gagal dimuat.');
        }
    };

    const columns: Column<BarangMasukItem>[] = [
        { header: 'Tanggal', accessorKey: 'tanggal', className: 'w-36 whitespace-nowrap' },
        {
            header: 'Merek & Model',
            cell: (item) => (
                <div>
                    <p className="font-medium">{[item.merek, item.model].filter(Boolean).join(' ') || '—'}</p>
                    <p className="text-xs text-muted-foreground">{item.kategori || 'Tanpa kategori'}</p>
                </div>
            ),
        },
        { header: 'Asal Barang', accessorKey: 'asal_barang', cell: (item) => item.asal_barang || '—' },
    ];

    return (
        <TransactionPage title="Barang Masuk" description="Kelola penerimaan barang baru dan riwayat unit yang masuk ke gudang.">
            <DataTable
                data={barangMasuk.data}
                columns={columns}
                links={barangMasuk.links}
                paginationMeta={barangMasuk}
                initialSearch={filterData.search}
                searchPlaceholder="Cari serial, merek, atau model..."
                onSearch={(value) => {
                    setFilterData((current) => ({ ...current, search: value }));
                    search(value);
                }}
                onCreate={permissions.includes(PERMISSIONS.CREATE_BARANG_MASUK) ? () => router.visit(route('barang-masuk.create')) : undefined}
                createLabel="Tambah barang masuk"
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
                        <TransactionFilterField label="Asal barang">
                            <select
                                value={filterData.asal_barang_id}
                                onChange={(event) => updateFilter('asal_barang_id', event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Semua asal</option>
                                {asalOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.nama}
                                    </option>
                                ))}
                            </select>
                        </TransactionFilterField>
                        <TransactionFilterField label="Merek">
                            <select value={filterData.merek} onChange={(event) => updateFilter('merek', event.target.value)} className={selectClass}>
                                <option value="">Semua merek</option>
                                {merekOptions.map((option) => (
                                    <option key={option.id} value={option.nama}>
                                        {option.nama}
                                    </option>
                                ))}
                            </select>
                        </TransactionFilterField>
                        <TransactionFilterField label="Urutkan">
                            <select
                                value={filterData.sort_by}
                                onChange={(event) => updateFilter('sort_by', event.target.value)}
                                className={selectClass}
                            >
                                <option value="desc">Terbaru</option>
                                <option value="asc">Terlama</option>
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
                        {permissions.includes(PERMISSIONS.EDIT_BARANG_MASUK) && (
                            <Button asChild variant="ghost" size="icon">
                                <Link href={route('barang-masuk.edit', item.id)} aria-label={`Edit transaksi ${item.id}`}>
                                    <Edit3 />
                                </Link>
                            </Button>
                        )}
                        {permissions.includes(PERMISSIONS.DELETE_BARANG_MASUK) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(item)}
                                aria-label={`Batalkan transaksi ${item.id}`}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                )}
            />

            <DetailBarangMasukModal show={Boolean(selectedBarang)} onClose={() => setSelectedBarang(null)} barang={selectedBarang} />
            <ConfirmDeleteDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title="Batalkan transaksi barang masuk?"
                description="Seluruh unit dalam transaksi ini akan dibatalkan dan stok disesuaikan. Tindakan ditolak jika salah satu unit sudah memiliki aktivitas lanjutan."
                processing={deleting}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    setDeleting(true);
                    router.delete(route('barang-masuk.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onFinish: () => setDeleting(false),
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </TransactionPage>
    );
}
