import { Column, DataTable } from '@/components/data-table';
import { StockFilterField, StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { router } from '@inertiajs/react';
import { Download, Eye, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DetailStokModal } from './detail';

type StokItem = {
    id: string;
    kategori: string;
    label: string;
    merek: string;
    model: string;
    jumlah_rusak: number;
    jumlah_perbaikan: number;
    jumlah_tersedia: number;
    jumlah_total: number;
    model_id: number;
};
type FilterItem = { id: number; nama: string };
type Filters = { search: string; kategori: string; merek: string; lokasi: string };
type DetailBarang = {
    id: number;
    serial_number: string;
    status: string;
    rak?: { kode_rak?: string };
};
type Props = {
    stokBarang: {
        data: Omit<StokItem, 'id'>[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Partial<Filters>;
    kategoriList: FilterItem[];
    merekList: FilterItem[];
    lokasiList: FilterItem[];
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

function StockCount({ value, tone = 'neutral' }: { value: number; tone?: 'neutral' | 'danger' | 'warning' | 'success' }) {
    const styles = {
        neutral: 'bg-muted text-foreground',
        danger: 'bg-destructive/10 text-destructive',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };

    return <span className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{value}</span>;
}

export default function StokGudangIndex({ stokBarang, filters, kategoriList, merekList, lokasiList }: Props) {
    const items = useMemo(() => stokBarang.data.map((item, index) => ({ ...item, id: `${item.model_id}-${index}` })), [stokBarang.data]);
    const [filterData, setFilterData] = useState<Filters>({
        search: filters.search ?? '',
        kategori: filters.kategori ?? '',
        merek: filters.merek ?? '',
        lokasi: filters.lokasi ?? '',
    });
    const [selectedItem, setSelectedItem] = useState<StokItem | null>(null);
    const [detailData, setDetailData] = useState<DetailBarang[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const visit = (next: Filters) => {
        router.get(route('stok.gudang.index'), next, { preserveState: true, preserveScroll: true, replace: true });
    };
    const search = useDebouncedCallback((value: string) => visit({ ...filterData, search: value }));
    const updateFilter = (key: keyof Filters, value: string) => {
        const next = { ...filterData, [key]: value };
        setFilterData(next);
        visit(next);
    };
    const resetFilters = () => {
        const reset = { search: '', kategori: '', merek: '', lokasi: '' };
        setFilterData(reset);
        visit(reset);
    };

    const openDetail = async (item: StokItem) => {
        setSelectedItem(item);
        setDetailData([]);
        setLoadingDetail(true);

        try {
            const response = await fetch(route('api.stok-gudang.detail', { modelBarang: item.model_id }), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error();
            setDetailData((await response.json()) as DetailBarang[]);
        } catch {
            toast.error('Detail stok gudang gagal dimuat.');
        } finally {
            setLoadingDetail(false);
        }
    };

    const columns: Column<StokItem>[] = [
        {
            header: 'Barang',
            cell: (item) => (
                <div>
                    <p className="font-medium">{[item.merek, item.model].filter(Boolean).join(' ')}</p>
                    <p className="text-xs text-muted-foreground">{item.label || item.kategori}</p>
                </div>
            ),
        },
        { header: 'Kategori', accessorKey: 'kategori' },
        { header: 'Total', cell: (item) => <StockCount value={item.jumlah_total} /> },
        { header: 'Tersedia', cell: (item) => <StockCount value={item.jumlah_tersedia} tone="success" /> },
        { header: 'Rusak', cell: (item) => <StockCount value={item.jumlah_rusak} tone="danger" /> },
        { header: 'Perbaikan', cell: (item) => <StockCount value={item.jumlah_perbaikan} tone="warning" /> },
    ];

    return (
        <StockPage
            title="Stok Gudang"
            description="Pantau ketersediaan dan kondisi barang di seluruh gudang."
            actions={
                <Button asChild variant="outline">
                    <a href={route('stock.gudang.exportPdf', filterData)} target="_blank" rel="noreferrer">
                        <Download />
                        Ekspor PDF
                    </a>
                </Button>
            }
        >
            <DataTable
                data={items}
                columns={columns}
                links={stokBarang.links}
                paginationMeta={stokBarang}
                initialSearch={filterData.search}
                searchPlaceholder="Cari model barang..."
                onSearch={(value) => {
                    setFilterData((current) => ({ ...current, search: value }));
                    search(value);
                }}
                customFilters={
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
                        <StockFilterField label="Kategori">
                            <select
                                value={filterData.kategori}
                                onChange={(event) => updateFilter('kategori', event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Semua kategori</option>
                                {kategoriList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                        </StockFilterField>
                        <StockFilterField label="Merek">
                            <select value={filterData.merek} onChange={(event) => updateFilter('merek', event.target.value)} className={selectClass}>
                                <option value="">Semua merek</option>
                                {merekList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                        </StockFilterField>
                        <StockFilterField label="Gudang">
                            <select
                                value={filterData.lokasi}
                                onChange={(event) => updateFilter('lokasi', event.target.value)}
                                className={selectClass}
                            >
                                <option value="">Semua gudang</option>
                                {lokasiList.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                        </StockFilterField>
                        <Button type="button" variant="outline" onClick={resetFilters} className="self-end">
                            <RotateCcw />
                            Reset filter
                        </Button>
                    </div>
                }
                actions={(item) => (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(item)}
                        aria-label={`Lihat detail ${item.merek} ${item.model}`}
                    >
                        <Eye />
                    </Button>
                )}
            />

            <DetailStokModal
                isOpen={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                item={selectedItem ?? undefined}
                details={detailData}
                isLoading={loadingDetail}
            />
        </StockPage>
    );
}
