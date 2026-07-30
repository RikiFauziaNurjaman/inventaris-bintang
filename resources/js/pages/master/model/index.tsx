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
import { useMemo, useState } from 'react';

type Kategori = { id: number; nama: string };
type Merek = { id: number; nama: string };
type JenisBarang = { id: number; nama: string; kategori_id?: number };
type ModelBarang = {
    id: number;
    nama: string;
    label: string | null;
    kategori: Kategori;
    merek: Merek;
    jenis?: JenisBarang | null;
};
type Props = {
    modelBarang: {
        data: ModelBarang[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    kategori: Kategori[];
    merek: Merek[];
    jenis: JenisBarang[];
    labelList: string[];
    filters: { search?: string };
};

const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

export default function Index({ modelBarang, kategori, merek, jenis, labelList, filters }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<ModelBarang | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<ModelBarang | null>(null);
    const form = useForm({ nama: '', label: '', kategori_id: '', merek_id: '', jenis_id: '' });
    const filteredJenis = useMemo(
        () => jenis.filter((item) => String(item.kategori_id ?? '') === form.data.kategori_id),
        [form.data.kategori_id, jenis],
    );
    const search = useDebouncedCallback((value: string) => {
        router.get(route('model.index'), { search: value }, { preserveState: true, preserveScroll: true, replace: true });
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
            form.put(route('model.update', editing.id), options);
        } else {
            form.post(route('model.store'), options);
        }
    };

    const columns: Column<ModelBarang>[] = [
        {
            header: 'Model Barang',
            accessorKey: 'nama',
            cell: (item) => (
                <div>
                    <p className="font-medium">
                        {item.merek?.nama} {item.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.kategori?.nama}</p>
                </div>
            ),
        },
        { header: 'Jenis', accessorKey: 'jenis', cell: (item) => item.jenis?.nama || '—' },
        {
            header: 'Label',
            accessorKey: 'label',
            cell: (item) =>
                item.label ? (
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{item.label}</span>
                ) : (
                    '—'
                ),
        },
    ];

    return (
        <MasterDataPage title="Model Barang" description="Kelola model, merek, kategori, jenis, dan label inventaris.">
            {showForm && (
                <MasterDataFormPanel title={editing ? 'Edit model barang' : 'Tambah model barang'} onClose={closeForm}>
                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nama-model">Nama model</Label>
                            <Input
                                id="nama-model"
                                value={form.data.nama}
                                onChange={(event) => form.setData('nama', event.target.value)}
                                placeholder="Contoh: ThinkPad E14"
                                aria-invalid={Boolean(form.errors.nama)}
                                required
                            />
                            {form.errors.nama && <p className="text-sm text-destructive">{form.errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="merek-model">Merek</Label>
                            <select
                                id="merek-model"
                                value={form.data.merek_id}
                                onChange={(event) => form.setData('merek_id', event.target.value)}
                                className={selectClass}
                                aria-invalid={Boolean(form.errors.merek_id)}
                                required
                            >
                                <option value="">Pilih merek</option>
                                {merek.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.merek_id && <p className="text-sm text-destructive">{form.errors.merek_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kategori-model">Kategori</Label>
                            <select
                                id="kategori-model"
                                value={form.data.kategori_id}
                                onChange={(event) => form.setData((data) => ({ ...data, kategori_id: event.target.value, jenis_id: '' }))}
                                className={selectClass}
                                aria-invalid={Boolean(form.errors.kategori_id)}
                                required
                            >
                                <option value="">Pilih kategori</option>
                                {kategori.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.kategori_id && <p className="text-sm text-destructive">{form.errors.kategori_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jenis-model">Jenis barang</Label>
                            <select
                                id="jenis-model"
                                value={form.data.jenis_id}
                                onChange={(event) => form.setData('jenis_id', event.target.value)}
                                className={selectClass}
                                disabled={!form.data.kategori_id}
                                aria-invalid={Boolean(form.errors.jenis_id)}
                            >
                                <option value="">{form.data.kategori_id ? 'Pilih jenis' : 'Pilih kategori terlebih dahulu'}</option>
                                {filteredJenis.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.jenis_id && <p className="text-sm text-destructive">{form.errors.jenis_id}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="label-model">Label barang</Label>
                            <Input
                                id="label-model"
                                list="label-model-options"
                                value={form.data.label}
                                onChange={(event) => form.setData('label', event.target.value)}
                                placeholder="Pilih atau ketik label baru"
                                aria-invalid={Boolean(form.errors.label)}
                            />
                            <datalist id="label-model-options">
                                {labelList.map((label) => (
                                    <option key={label} value={label} />
                                ))}
                            </datalist>
                            {form.errors.label && <p className="text-sm text-destructive">{form.errors.label}</p>}
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan model'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={modelBarang.data}
                columns={columns}
                links={modelBarang.links}
                paginationMeta={modelBarang}
                searchPlaceholder="Cari model, kategori, atau label..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
                onCreate={
                    permissions.includes(PERMISSIONS.CREATE_MODEL)
                        ? () => {
                              form.reset();
                              form.clearErrors();
                              setEditing(null);
                              setShowForm(true);
                          }
                        : undefined
                }
                createLabel="Tambah model"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {permissions.includes(PERMISSIONS.EDIT_MODEL) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    form.setData({
                                        nama: item.nama,
                                        label: item.label ?? '',
                                        kategori_id: String(item.kategori.id),
                                        merek_id: String(item.merek.id),
                                        jenis_id: item.jenis?.id ? String(item.jenis.id) : '',
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
                        {permissions.includes(PERMISSIONS.DELETE_MODEL) && (
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
                description={`Model “${pendingDelete?.nama ?? ''}” akan dihapus. Pastikan tidak ada barang yang masih menggunakan model ini.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route('model.destroy', pendingDelete.id), {
                        preserveScroll: true,
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </MasterDataPage>
    );
}
