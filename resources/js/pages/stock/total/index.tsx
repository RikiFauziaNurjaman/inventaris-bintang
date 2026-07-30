import { Column, DataTable } from '@/components/data-table';
import { StockFilterField, StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { router, usePage } from '@inertiajs/react';
import { Download, RotateCcw } from 'lucide-react';
import { useState } from 'react';

type StockRow = {
    id: number;
    merek?: string | null;
    model?: string | null;
    kategori?: string | null;
    jenis?: string | null;
    lokasi?: string | null;
    total: number;
    baik: number;
    dipinjamkan: number;
    rusak: number;
    perbaikan: number;
    terjual: number;
    dimusnahkan: number;
};
type Summary = Omit<StockRow, 'id' | 'merek' | 'model' | 'kategori' | 'jenis' | 'lokasi'>;
type Filters = {
    search: string;
    kategori: string;
    jenis: string;
    lokasi: string;
    status: string;
    kondisi: string;
};
type PageProps = {
    barangList: {
        data: StockRow[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    summary: Summary;
    filters?: Partial<Filters>;
    filterOptions: {
        kategoriList: string[];
        jenisList: string[];
        lokasiList: string[];
        statusList: string[];
        kondisiList: string[];
    };
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
const statusLabels: Record<string, string> = {
    baik: 'Baik',
    bagus: 'Baik',
    rusak: 'Rusak',
    diperbaiki: 'Dalam perbaikan',
    dipinjamkan: 'Dipinjamkan',
    dijual: 'Dijual',
    maintenance: 'Maintenance',
    dimusnahkan: 'Dimusnahkan',
    menunggu: 'Menunggu',
};

export default function TotalStockIndex() {
    const { barangList, summary, filters = {}, filterOptions } = usePage<PageProps>().props;
    const [filterData, setFilterData] = useState<Filters>({
        search: filters.search ?? '',
        kategori: filters.kategori ?? '',
        jenis: filters.jenis ?? '',
        lokasi: filters.lokasi ?? '',
        status: filters.status ?? '',
        kondisi: filters.kondisi ?? '',
    });

    const visit = (next: Filters) => {
        router.get(route('total-stock.index'), next, { preserveState: true, preserveScroll: true, replace: true });
    };
    const search = useDebouncedCallback((value: string) => visit({ ...filterData, search: value }));
    const updateFilter = (key: keyof Filters, value: string) => {
        const next = { ...filterData, [key]: value };
        setFilterData(next);
        visit(next);
    };
    const resetFilters = () => {
        const reset = { search: '', kategori: '', jenis: '', lokasi: '', status: '', kondisi: '' };
        setFilterData(reset);
        visit(reset);
    };
    const count = (value: number) => Number(value ?? 0).toLocaleString('id-ID');

    const columns: Column<StockRow>[] = [
        {
            header: 'Lokasi',
            cell: (item) => <span className="font-medium">{item.lokasi || 'Tanpa lokasi'}</span>,
        },
        {
            header: 'Barang',
            cell: (item) => (
                <div>
                    <p className="font-medium">{[item.merek, item.model].filter(Boolean).join(' ') || 'Tanpa model'}</p>
                    <p className="text-xs text-muted-foreground">{[item.kategori, item.jenis].filter(Boolean).join(' · ') || 'Tanpa klasifikasi'}</p>
                </div>
            ),
        },
        { header: 'Total', cell: (item) => <span className="font-semibold">{count(item.total)}</span> },
        { header: 'Baik', cell: (item) => count(item.baik) },
        { header: 'Dipinjamkan', cell: (item) => count(item.dipinjamkan) },
        { header: 'Rusak', cell: (item) => count(item.rusak) },
        { header: 'Perbaikan', cell: (item) => count(item.perbaikan) },
        { header: 'Terjual', cell: (item) => count(item.terjual) },
        { header: 'Dimusnahkan', cell: (item) => count(item.dimusnahkan) },
    ];

    return (
        <StockPage
            title="Ringkasan Stok"
            description="Rekap jumlah inventaris per model dan lokasi. Pengelolaan setiap serial tetap dilakukan melalui Data Barang."
            actions={
                <Button asChild variant="outline">
                    <a href={route('total-stock.exportPdf', filterData)} target="_blank" rel="noreferrer">
                        <Download />
                        Ekspor PDF
                    </a>
                </Button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ['Total unit', summary.total],
                    ['Status baik', summary.baik],
                    ['Dipinjamkan', summary.dipinjamkan],
                    ['Perlu tindak lanjut', Number(summary.rusak) + Number(summary.perbaikan)],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border bg-card p-4 shadow-xs">
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight">{count(Number(value))}</p>
                    </div>
                ))}
            </div>

            <DataTable
                data={barangList.data}
                columns={columns}
                links={barangList.links}
                paginationMeta={barangList}
                initialSearch={filterData.search}
                searchPlaceholder="Cari model, merek, kategori, jenis, atau lokasi..."
                onSearch={(value) => {
                    setFilterData((current) => ({ ...current, search: value }));
                    search(value);
                }}
                customFilters={
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
                        {(
                            [
                                ['kategori', 'Kategori', filterOptions.kategoriList],
                                ['jenis', 'Jenis', filterOptions.jenisList],
                                ['lokasi', 'Lokasi', filterOptions.lokasiList],
                                ['status', 'Status', filterOptions.statusList],
                                ['kondisi', 'Kondisi', filterOptions.kondisiList],
                            ] as const
                        ).map(([key, label, options]) => (
                            <StockFilterField key={key} label={label}>
                                <select value={filterData[key]} onChange={(event) => updateFilter(key, event.target.value)} className={selectClass}>
                                    <option value="">Semua {label.toLowerCase()}</option>
                                    {options.map((option) => (
                                        <option key={option} value={option}>
                                            {statusLabels[option] ?? (option === 'baru' ? 'Baru' : option === 'second' ? 'Second' : option)}
                                        </option>
                                    ))}
                                </select>
                            </StockFilterField>
                        ))}
                        <Button type="button" variant="outline" onClick={resetFilters} className="self-end">
                            <RotateCcw />
                            Reset filter
                        </Button>
                    </div>
                }
            />
        </StockPage>
    );
}
