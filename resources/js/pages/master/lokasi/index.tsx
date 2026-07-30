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

type Lokasi = { id: number; nama: string; alamat: string | null };
type Props = {
    lokasi: {
        data: Lokasi[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search?: string };
};

export default function Index({ lokasi, filters }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<Lokasi | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Lokasi | null>(null);
    const form = useForm({ nama: '', alamat: '' });
    const search = useDebouncedCallback((value: string) => {
        router.get(route('lokasi.index'), { search: value }, { preserveState: true, preserveScroll: true, replace: true });
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
            form.put(route('lokasi.update', editing.id), options);
        } else {
            form.post(route('lokasi.store'), options);
        }
    };

    const columns: Column<Lokasi>[] = [
        { header: 'Nama Lokasi', accessorKey: 'nama' },
        { header: 'Alamat', accessorKey: 'alamat', cell: (item) => item.alamat || '—' },
    ];

    return (
        <MasterDataPage title="Lokasi" description="Kelola gudang dan lokasi distribusi tempat inventaris berada.">
            {showForm && (
                <MasterDataFormPanel title={editing ? 'Edit lokasi' : 'Tambah lokasi'} onClose={closeForm}>
                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nama-lokasi">Nama lokasi</Label>
                            <Input
                                id="nama-lokasi"
                                value={form.data.nama}
                                onChange={(event) => form.setData('nama', event.target.value)}
                                placeholder="Contoh: Gudang Utama"
                                aria-invalid={Boolean(form.errors.nama)}
                                required
                            />
                            {form.errors.nama && <p className="text-sm text-destructive">{form.errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alamat-lokasi">Alamat</Label>
                            <Input
                                id="alamat-lokasi"
                                value={form.data.alamat}
                                onChange={(event) => form.setData('alamat', event.target.value)}
                                placeholder="Alamat lokasi"
                                aria-invalid={Boolean(form.errors.alamat)}
                                required={!editing}
                            />
                            {form.errors.alamat && <p className="text-sm text-destructive">{form.errors.alamat}</p>}
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan lokasi'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={lokasi.data}
                columns={columns}
                links={lokasi.links}
                paginationMeta={lokasi}
                searchPlaceholder="Cari lokasi..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
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
                createLabel="Tambah lokasi"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {permissions.includes(PERMISSIONS.EDIT_LOKASI_DISTRIBUSI) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    form.setData({ nama: item.nama, alamat: item.alamat ?? '' });
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
                description={`Lokasi “${pendingDelete?.nama ?? ''}” akan dihapus. Pastikan tidak ada inventaris yang masih terkait.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route('lokasi.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </MasterDataPage>
    );
}
