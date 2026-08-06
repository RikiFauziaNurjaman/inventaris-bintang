import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permission';
import { router, usePage } from '@inertiajs/react';
import { Check, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type StokPerbaikan = {
    id: string;
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    nama_barang: string;
    jumlah_perbaikan: number;
};
type DetailBarang = {
    id: number;
    serial_number: string;
    kondisi_awal: string;
    keterangan?: string;
};
type Props = {
    stokPerbaikan: Omit<StokPerbaikan, 'id'>[];
};

export default function StokPerbaikanIndex({ stokPerbaikan }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const canEdit = (auth.permissions ?? []).includes(PERMISSIONS.EDIT_STOK_DIPERBAIKI);
    const [search, setSearch] = useState('');
    const [currentItem, setCurrentItem] = useState<StokPerbaikan | null>(null);
    const [detailItems, setDetailItems] = useState<DetailBarang[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const items = useMemo(
        () =>
            stokPerbaikan
                .map((item) => ({ ...item, id: `${item.model_id}-${item.lokasi_id}` }))
                .filter((item) => `${item.lokasi} ${item.kategori} ${item.nama_barang}`.toLowerCase().includes(search.toLowerCase())),
        [search, stokPerbaikan],
    );

    const closeDialog = () => {
        if (processing) return;
        setCurrentItem(null);
        setDetailItems([]);
        setSelectedIds([]);
    };

    const openDetail = async (item: StokPerbaikan) => {
        setCurrentItem(item);
        setDetailItems([]);
        setSelectedIds([]);
        setLoading(true);

        try {
            const response = await fetch(route('stock.perbaikan.show', { model_id: item.model_id, lokasi_id: item.lokasi_id }), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error();
            setDetailItems((await response.json()) as DetailBarang[]);
        } catch {
            toast.error('Detail barang dalam perbaikan gagal dimuat.');
            setCurrentItem(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (id: number) => {
        setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
    };
    const toggleAll = () => {
        setSelectedIds((current) => (current.length === detailItems.length ? [] : detailItems.map((item) => item.id)));
    };

    const completeRepair = () => {
        if (!selectedIds.length) {
            toast.error('Pilih setidaknya satu barang.');
            return;
        }

        setProcessing(true);
        router.post(
            route('stock.perbaikan.selesai'),
            { barang_ids: selectedIds },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: closeDialog,
            },
        );
    };

    const columns: Column<StokPerbaikan>[] = [
        { header: 'Lokasi', accessorKey: 'lokasi' },
        { header: 'Kategori', accessorKey: 'kategori' },
        { header: 'Barang', accessorKey: 'nama_barang' },
        {
            header: 'Dalam Perbaikan',
            cell: (item) => (
                <span className="inline-flex min-w-9 justify-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {item.jumlah_perbaikan}
                </span>
            ),
        },
    ];

    return (
        <StockPage title="Dalam Perbaikan" description="Pantau unit yang sedang diperbaiki dan selesaikan prosesnya setelah siap digunakan kembali.">
            <DataTable
                data={items}
                columns={columns}
                initialSearch={search}
                searchPlaceholder="Cari lokasi atau barang..."
                onSearch={setSearch}
                actions={(item) => (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(item)}
                        aria-label={`Lihat detail ${item.nama_barang}`}
                    >
                        <Eye />
                    </Button>
                )}
            />

            <Dialog open={Boolean(currentItem)} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-h-[90vh] gap-5 overflow-y-auto rounded-2xl sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detail barang dalam perbaikan</DialogTitle>
                        <DialogDescription>
                            {currentItem?.nama_barang} di {currentItem?.lokasi}. Pilih unit yang perbaikannya telah selesai.
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">Memuat detail barang...</div>
                    ) : (
                        <div className="max-h-80 overflow-auto rounded-xl border bg-muted/20">
                            <Table>
                                <TableHeader className="sticky top-0 bg-muted">
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={detailItems.length > 0 && selectedIds.length === detailItems.length}
                                                onChange={toggleAll}
                                                className="size-4 accent-primary"
                                                aria-label="Pilih semua barang"
                                            />
                                        </TableHead>
                                        <TableHead>Serial Number</TableHead>
                                        <TableHead>Kondisi Awal</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detailItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleItem(item.id)}
                                                    className="size-4 accent-primary"
                                                    aria-label={`Pilih ${item.serial_number}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{item.serial_number}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                                    {item.kondisi_awal}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{item.keterangan || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {!detailItems.length && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Tidak ada unit dalam perbaikan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeDialog} disabled={processing}>
                            Tutup
                        </Button>
                        {canEdit && (
                            <Button type="button" onClick={completeRepair} disabled={processing || !selectedIds.length}>
                                <Check />
                                Selesaikan perbaikan ({selectedIds.length})
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StockPage>
    );
}
