import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { MasterDataFormPanel } from '@/components/master-data-form-panel';
import { MasterDataPage } from '@/components/master-data-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PERMISSIONS } from '@/constants/permission';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { router, useForm, usePage } from '@inertiajs/react';
import { Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Lokasi = { id: number; nama: string };
type RakBarang = {
    id: number;
    lokasi_id?: number;
    nama_rak: string;
    baris: string | null;
    kode_rak: string;
    lokasi: Lokasi;
};
type Props = {
    rakList: {
        data: RakBarang[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    lokasiList?: Lokasi[];
    filters: { search?: string };
};

const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function Index({ rakList, lokasiList = [], filters }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<RakBarang | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<RakBarang | null>(null);
    const form = useForm({ lokasi_id: '', nama_rak: '', baris: '', kode_rak: '' });
    const search = useDebouncedCallback((value: string) => {
        router.get(route('rak-barang.index'), { search: value }, { preserveState: true, preserveScroll: true, replace: true });
    });

    const closeForm = () => {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setShowForm(false);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: closeForm };
        if (editing) {
            form.put(route('rak-barang.update', editing.id), options);
        } else {
            form.post(route('rak-barang.store'), options);
        }
    };

    const columns: Column<RakBarang>[] = [
        { header: 'Gudang / Lokasi', accessorKey: 'lokasi', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Nama Rak', accessorKey: 'nama_rak' },
        { header: 'Kode Rak', accessorKey: 'kode_rak' },
        { header: 'Baris', accessorKey: 'baris', cell: (item) => item.baris || '—' },
    ];

    return (
        <MasterDataPage title="Rak Barang" description="Atur rak dan kode penyimpanan barang pada setiap gudang.">
            {showForm && (
                <MasterDataFormPanel title={editing ? 'Edit rak barang' : 'Tambah rak barang'} onClose={closeForm}>
                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="lokasi-rak">Gudang / lokasi</Label>
                            <select
                                id="lokasi-rak"
                                value={form.data.lokasi_id}
                                onChange={(event) => form.setData('lokasi_id', event.target.value)}
                                className={selectClass}
                                aria-invalid={Boolean(form.errors.lokasi_id)}
                                required
                            >
                                <option value="">Pilih gudang</option>
                                {lokasiList.map((lokasi) => (
                                    <option key={lokasi.id} value={lokasi.id}>
                                        {lokasi.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.lokasi_id && <p className="text-sm text-destructive">{form.errors.lokasi_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama-rak">Nama rak</Label>
                            <Input
                                id="nama-rak"
                                value={form.data.nama_rak}
                                onChange={(event) => form.setData('nama_rak', event.target.value)}
                                aria-invalid={Boolean(form.errors.nama_rak)}
                                required
                            />
                            {form.errors.nama_rak && <p className="text-sm text-destructive">{form.errors.nama_rak}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kode-rak">Kode rak</Label>
                            <Input
                                id="kode-rak"
                                value={form.data.kode_rak}
                                onChange={(event) => form.setData('kode_rak', event.target.value)}
                                aria-invalid={Boolean(form.errors.kode_rak)}
                                required
                            />
                            {form.errors.kode_rak && <p className="text-sm text-destructive">{form.errors.kode_rak}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="baris-rak">Baris</Label>
                            <Input
                                id="baris-rak"
                                value={form.data.baris}
                                onChange={(event) => form.setData('baris', event.target.value)}
                                aria-invalid={Boolean(form.errors.baris)}
                            />
                            {form.errors.baris && <p className="text-sm text-destructive">{form.errors.baris}</p>}
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan rak'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={rakList.data}
                columns={columns}
                links={rakList.links}
                paginationMeta={rakList}
                searchPlaceholder="Cari nama, kode, atau baris rak..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
                onCreate={
                    permissions.includes(PERMISSIONS.CREATE_RAK_BARANG)
                        ? () => {
                              form.reset();
                              form.clearErrors();
                              setEditing(null);
                              setShowForm(true);
                          }
                        : undefined
                }
                createLabel="Tambah rak"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {permissions.includes(PERMISSIONS.EDIT_RAK_BARANG) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    form.setData({
                                        lokasi_id: String(item.lokasi?.id ?? item.lokasi_id ?? ''),
                                        nama_rak: item.nama_rak,
                                        kode_rak: item.kode_rak,
                                        baris: item.baris ?? '',
                                    });
                                    form.clearErrors();
                                    setEditing(item);
                                    setShowForm(true);
                                }}
                                aria-label={`Edit ${item.nama_rak}`}
                            >
                                <Edit3 />
                            </Button>
                        )}
                        {permissions.includes(PERMISSIONS.DELETE_RAK_BARANG) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(item)}
                                aria-label={`Hapus ${item.nama_rak}`}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                )}
            />

            <ConfirmDeleteDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                description={`Rak “${pendingDelete?.nama_rak ?? ''}” akan dihapus. Pastikan tidak ada barang yang masih ditempatkan di rak ini.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route('rak-barang.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </MasterDataPage>
    );
}
