import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { useMemo, useState } from 'react';

type StokTerjualItem = {
    id: string;
    lokasi: string;
    kategori: string;
    nama_barang: string;
    jumlah_terjual: number;
};
type Props = {
    stokTerjual: Omit<StokTerjualItem, 'id'>[];
};

export default function StokTerjualIndex({ stokTerjual }: Props) {
    const [search, setSearch] = useState('');
    const items = useMemo(
        () =>
            stokTerjual
                .map((item, index) => ({ ...item, id: `${item.lokasi}-${item.nama_barang}-${index}` }))
                .filter((item) => `${item.lokasi} ${item.kategori} ${item.nama_barang}`.toLowerCase().includes(search.toLowerCase())),
        [search, stokTerjual],
    );
    const columns: Column<StokTerjualItem>[] = [
        { header: 'Lokasi', accessorKey: 'lokasi' },
        { header: 'Kategori', accessorKey: 'kategori' },
        { header: 'Barang', accessorKey: 'nama_barang' },
        {
            header: 'Jumlah Terjual',
            cell: (item) => (
                <span className="inline-flex min-w-9 justify-center rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {item.jumlah_terjual}
                </span>
            ),
        },
    ];

    return (
        <StockPage title="Stok Terjual" description="Daftar barang yang telah tercatat sebagai penjualan.">
            <DataTable data={items} columns={columns} initialSearch={search} searchPlaceholder="Cari lokasi atau barang..." onSearch={setSearch} />
        </StockPage>
    );
}
