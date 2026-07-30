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
type SubLokasi = {
    id: number;
    lokasi_id: number;
    nama: string;
    kode: string | null;
    lantai: string | null;
    keterangan: string | null;
    lokasi: Lokasi;
};
type Props = {
    subLokasi: {
        data: SubLokasi[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    lokasiList: Lokasi[];
    filters: { search?: string; lokasi_id?: string };
};

const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function SubLokasiIndex({ subLokasi, lokasiList, filters }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<SubLokasi | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<SubLokasi | null>(null);
    const [lokasiFilter, setLokasiFilter] = useState(filters.lokasi_id ?? '');
    const form = useForm({ lokasi_id: '', nama: '', kode: '', lantai: '', keterangan: '' });
    const search = useDebouncedCallback((value: string) => {
        router.get(
            route('sub-lokasi.index'),
            { search: value, lokasi_id: lokasiFilter },
            { preserveState: true, preserveScroll: true, replace: true },
        );
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
            form.put(route('sub-lokasi.update', editing.id), options);
        } else {
            form.post(route('sub-lokasi.store'), options);
        }
    };

    const columns: Column<SubLokasi>[] = [
        { header: 'Lokasi', accessorKey: 'lokasi', cell: (item) => item.lokasi?.nama || '—' },
        { header: 'Sub-Lokasi', accessorKey: 'nama' },
        { header: 'Kode', accessorKey: 'kode', cell: (item) => item.kode || '—' },
        { header: 'Lantai', accessorKey: 'lantai', cell: (item) => item.lantai || '—' },
        { header: 'Keterangan', accessorKey: 'keterangan', cell: (item) => item.keterangan || '—' },
    ];

    return (
        <MasterDataPage title="Sub-Lokasi" description="Kelola ruangan atau area rinci di dalam setiap lokasi distribusi.">
            {showForm && (
                <MasterDataFormPanel title={editing ? 'Edit sub-lokasi' : 'Tambah sub-lokasi'} onClose={closeForm}>
                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="lokasi-sub">Lokasi</Label>
                            <select
                                id="lokasi-sub"
                                value={form.data.lokasi_id}
                                onChange={(event) => form.setData('lokasi_id', event.target.value)}
                                className={selectClass}
                                aria-invalid={Boolean(form.errors.lokasi_id)}
                                required
                            >
                                <option value="">Pilih lokasi</option>
                                {lokasiList.map((lokasi) => (
                                    <option key={lokasi.id} value={lokasi.id}>
                                        {lokasi.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.lokasi_id && <p className="text-sm text-destructive">{form.errors.lokasi_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama-sub">Nama sub-lokasi</Label>
                            <Input
                                id="nama-sub"
                                value={form.data.nama}
                                onChange={(event) => form.setData('nama', event.target.value)}
                                placeholder="Contoh: Ruang Pendaftaran"
                                aria-invalid={Boolean(form.errors.nama)}
                                required
                            />
                            {form.errors.nama && <p className="text-sm text-destructive">{form.errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kode-sub">Kode</Label>
                            <Input
                                id="kode-sub"
                                value={form.data.kode}
                                onChange={(event) => form.setData('kode', event.target.value)}
                                placeholder="Contoh: REG"
                                aria-invalid={Boolean(form.errors.kode)}
                            />
                            {form.errors.kode && <p className="text-sm text-destructive">{form.errors.kode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lantai-sub">Lantai</Label>
                            <Input
                                id="lantai-sub"
                                value={form.data.lantai}
                                onChange={(event) => form.setData('lantai', event.target.value)}
                                placeholder="Contoh: 1"
                                aria-invalid={Boolean(form.errors.lantai)}
                            />
                            {form.errors.lantai && <p className="text-sm text-destructive">{form.errors.lantai}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="keterangan-sub">Keterangan</Label>
                            <textarea
                                id="keterangan-sub"
                                value={form.data.keterangan}
                                onChange={(event) => form.setData('keterangan', event.target.value)}
                                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                aria-invalid={Boolean(form.errors.keterangan)}
                            />
                            {form.errors.keterangan && <p className="text-sm text-destructive">{form.errors.keterangan}</p>}
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan sub-lokasi'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={subLokasi.data}
                columns={columns}
                links={subLokasi.links}
                paginationMeta={subLokasi}
                searchPlaceholder="Cari sub-lokasi..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
                customFilters={
                    <select
                        value={lokasiFilter}
                        onChange={(event) => {
                            const value = event.target.value;
                            setLokasiFilter(value);
                            router.get(
                                route('sub-lokasi.index'),
                                { search: filters.search ?? '', lokasi_id: value },
                                { preserveState: true, preserveScroll: true, replace: true },
                            );
                        }}
                        className={`${selectClass} sm:w-52`}
                        aria-label="Filter lokasi"
                    >
                        <option value="">Semua lokasi</option>
                        {lokasiList.map((lokasi) => (
                            <option key={lokasi.id} value={lokasi.id}>
                                {lokasi.nama}
                            </option>
                        ))}
                    </select>
                }
                onCreate={
                    permissions.includes(PERMISSIONS.CREATE_LOKASI_DISTRIBUSI)
                        ? () => {
                              form.reset();
                              form.clearErrors();
                              setEditing(null);
                              setShowForm(true);
                          }
                        : undefined
                }
                createLabel="Tambah sub-lokasi"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {permissions.includes(PERMISSIONS.EDIT_LOKASI_DISTRIBUSI) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    form.setData({
                                        lokasi_id: String(item.lokasi_id),
                                        nama: item.nama,
                                        kode: item.kode ?? '',
                                        lantai: item.lantai ?? '',
                                        keterangan: item.keterangan ?? '',
                                    });
                                    form.clearErrors();
                                    setEditing(item);
                                    setShowForm(true);
                                }}
                                aria-label={`Edit ${item.nama}`}
                            >
                                <Edit3 />
                            </Button>
                        )}
                        {permissions.includes(PERMISSIONS.DELETE_LOKASI_DISTRIBUSI) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(item)}
                                aria-label={`Hapus ${item.nama}`}
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
                description={`Sub-lokasi “${pendingDelete?.nama ?? ''}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route('sub-lokasi.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </MasterDataPage>
    );
}
