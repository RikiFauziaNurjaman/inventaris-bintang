import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Download, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

type StokDistribusiItem = {
    id: number;
    lokasi_id: number;
    lokasi: string;
    models: string[];
    jumlah_tersedia: number;
};
type Props = {
    stokDistribusi: Omit<StokDistribusiItem, 'id'>[];
};

export default function StokDistribusiIndex({ stokDistribusi }: Props) {
    const [search, setSearch] = useState('');
    const items = useMemo(
        () =>
            stokDistribusi
                .map((item) => ({ ...item, id: item.lokasi_id }))
                .filter((item) => `${item.lokasi} ${item.models.join(' ')}`.toLowerCase().includes(search.toLowerCase())),
        [search, stokDistribusi],
    );

    const columns: Column<StokDistribusiItem>[] = [
        { header: 'Lokasi', accessorKey: 'lokasi', className: 'min-w-44' },
        {
            header: 'Barang Tersedia',
            cell: (item) => (
                <div>
                    <p className="font-medium">{item.models.slice(0, 2).join(', ') || '—'}</p>
                    {item.models.length > 2 && <p className="text-xs text-muted-foreground">+{item.models.length - 2} model lainnya</p>}
                </div>
            ),
        },
        {
            header: 'Jumlah Unit',
            cell: (item) => (
                <span className="inline-flex min-w-9 justify-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {item.jumlah_tersedia}
                </span>
            ),
        },
    ];

    return (
        <StockPage
            title="Stok Distribusi"
            description="Pantau jumlah barang yang berada di setiap lokasi distribusi."
            actions={
                <Button asChild variant="outline">
                    <a href={route('stok.distribusi.exportPdf')} target="_blank" rel="noreferrer">
                        <Download />
                        Ekspor PDF
                    </a>
                </Button>
            }
        >
            <DataTable
                data={items}
                columns={columns}
                initialSearch={search}
                searchPlaceholder="Cari lokasi atau model..."
                onSearch={setSearch}
                actions={(item) => (
                    <Button asChild variant="ghost" size="sm">
                        <Link href={route('monitoring.lokasi.detail', item.lokasi_id)}>
                            <ExternalLink />
                            Detail lokasi
                        </Link>
                    </Button>
                )}
                actionWidth="w-36"
            />
        </StockPage>
    );
}
