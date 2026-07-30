import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Column, DataTable } from '@/components/data-table';
import { MasterDataFormPanel } from '@/components/master-data-form-panel';
import { MasterDataPage } from '@/components/master-data-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { router, useForm, usePage } from '@inertiajs/react';
import { Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Item = { id: number; nama: string };
type Props = {
    title: string;
    description: string;
    noun: string;
    routeName: string;
    data: {
        data: Item[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    search?: string;
    permissions: { create: string; edit: string; delete: string };
    placeholder: string;
};

export function SimpleMasterDataIndex({ title, description, noun, routeName, data, search: initialSearch, permissions, placeholder }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const userPermissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<Item | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
    const form = useForm({ nama: '' });
    const search = useDebouncedCallback((value: string) => {
        router.get(route(`${routeName}.index`), { search: value }, { preserveState: true, preserveScroll: true, replace: true });
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
            form.put(route(`${routeName}.update`, editing.id), options);
        } else {
            form.post(route(`${routeName}.store`), options);
        }
    };

    const columns: Column<Item>[] = [{ header: `Nama ${noun}`, accessorKey: 'nama' }];

    return (
        <MasterDataPage title={title} description={description}>
            {showForm && (
                <MasterDataFormPanel title={`${editing ? 'Edit' : 'Tambah'} ${noun.toLowerCase()}`} onClose={closeForm}>
                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`nama-${routeName}`}>Nama {noun.toLowerCase()}</Label>
                            <Input
                                id={`nama-${routeName}`}
                                value={form.data.nama}
                                onChange={(event) => form.setData('nama', event.target.value)}
                                placeholder={placeholder}
                                aria-invalid={Boolean(form.errors.nama)}
                                required
                            />
                            {form.errors.nama && <p className="text-sm text-destructive">{form.errors.nama}</p>}
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : `Simpan ${noun.toLowerCase()}`}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={data.data}
                columns={columns}
                links={data.links}
                paginationMeta={data}
                searchPlaceholder={`Cari ${noun.toLowerCase()}...`}
                initialSearch={initialSearch ?? ''}
                onSearch={search}
                onCreate={
                    userPermissions.includes(permissions.create)
                        ? () => {
                              form.reset();
                              form.clearErrors();
                              setEditing(null);
                              setShowForm(true);
                          }
                        : undefined
                }
                createLabel={`Tambah ${noun.toLowerCase()}`}
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {userPermissions.includes(permissions.edit) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    form.setData('nama', item.nama);
                                    form.clearErrors();
                                    setEditing(item);
                                    setShowForm(true);
                                }}
                                aria-label={`Edit ${item.nama}`}
                            >
                                <Edit3 />
                            </Button>
                        )}
                        {userPermissions.includes(permissions.delete) && (
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
                description={`${noun} “${pendingDelete?.nama ?? ''}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route(`${routeName}.destroy`, pendingDelete.id), {
                        preserveScroll: true,
                        onSuccess: () => setPendingDelete(null),
                    });
                }}
            />
        </MasterDataPage>
    );
}
