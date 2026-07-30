import { Column, DataTable } from '@/components/data-table';
import { StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import { ClipboardList, Eye, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type StokRusak = {
    id: string;
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    nama_barang: string;
    jumlah_rusak: number;
};
type DetailBarang = { id: number; serial_number: string };
type Props = { stokRusak: Omit<StokRusak, 'id'>[] };

export default function StokRusakIndex({ stokRusak }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const canEdit = (auth.permissions ?? []).includes(PERMISSIONS.EDIT_STOK_RUSAK);
    const [search, setSearch] = useState('');
    const [currentItem, setCurrentItem] = useState<StokRusak | null>(null);
    const [detailItems, setDetailItems] = useState<DetailBarang[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const items = useMemo(
        () =>
            stokRusak
                .map((item) => ({ ...item, id: `${item.model_id}-${item.lokasi_id}` }))
                .filter((item) => `${item.lokasi} ${item.kategori} ${item.nama_barang}`.toLowerCase().includes(search.toLowerCase())),
        [search, stokRusak],
    );

    const closeDialog = () => {
        if (processing) return;
        setCurrentItem(null);
        setDetailItems([]);
        setSelectedIds([]);
        setReason('');
    };

    const openDetail = async (item: StokRusak) => {
        setCurrentItem(item);
        setDetailItems([]);
        setSelectedIds([]);
        setReason('');
        setLoading(true);

        try {
            const response = await fetch(route('stock.rusak.show', { model_id: item.model_id, lokasi_id: item.lokasi_id }), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error();
            setDetailItems((await response.json()) as DetailBarang[]);
        } catch {
            toast.error('Detail stok rusak gagal dimuat.');
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

    const submit = (routeName: 'stock.rusak.perbaiki' | 'stock.rusak.pemusnahan.ajukan') => {
        if (!selectedIds.length) {
            toast.error('Pilih setidaknya satu barang.');
            return;
        }
        if (routeName === 'stock.rusak.pemusnahan.ajukan' && !reason.trim()) {
            toast.error('Alasan pemusnahan wajib diisi.');
            return;
        }

        setProcessing(true);
        router.post(
            route(routeName),
            { barang_ids: selectedIds, ...(routeName === 'stock.rusak.pemusnahan.ajukan' ? { alasan: reason } : {}) },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: closeDialog,
            },
        );
    };

    const columns: Column<StokRusak>[] = [
        { header: 'Lokasi', accessorKey: 'lokasi' },
        { header: 'Kategori', accessorKey: 'kategori' },
        { header: 'Barang', accessorKey: 'nama_barang' },
        {
            header: 'Jumlah Rusak',
            cell: (item) => (
                <span className="inline-flex min-w-9 justify-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    {item.jumlah_rusak}
                </span>
            ),
        },
    ];

    return (
        <StockPage
            title="Stok Rusak"
            description="Tinjau unit rusak untuk dipindahkan ke perbaikan atau diajukan untuk pemusnahan."
            actions={
                <Button asChild variant="outline">
                    <Link href={route('stock.rusak.pemusnahan.index')}>
                        <ClipboardList />
                        Daftar pemusnahan
                    </Link>
                </Button>
            }
        >
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
                        <DialogTitle>Detail barang rusak</DialogTitle>
                        <DialogDescription>
                            {currentItem?.nama_barang} di {currentItem?.lokasi}. Pilih serial number yang akan diproses.
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">Memuat detail barang...</div>
                    ) : (
                        <div className="space-y-5">
                            <div className="max-h-72 overflow-auto rounded-xl border bg-muted/20">
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
                                            </TableRow>
                                        ))}
                                        {!detailItems.length && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                    Tidak ada unit rusak.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {canEdit && (
                                <div className="space-y-2">
                                    <Label htmlFor="alasan-pemusnahan">Alasan pemusnahan</Label>
                                    <textarea
                                        id="alasan-pemusnahan"
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="Wajib diisi hanya jika mengajukan pemusnahan"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button type="button" variant="outline" onClick={closeDialog} disabled={processing}>
                            Tutup
                        </Button>
                        {canEdit && (
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => submit('stock.rusak.pemusnahan.ajukan')}
                                    disabled={processing || !selectedIds.length || !reason.trim()}
                                >
                                    Ajukan pemusnahan ({selectedIds.length})
                                </Button>
                                <Button type="button" onClick={() => submit('stock.rusak.perbaiki')} disabled={processing || !selectedIds.length}>
                                    <Wrench />
                                    Pindah ke perbaikan ({selectedIds.length})
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StockPage>
    );
}
