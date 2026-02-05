import { Column, DataTable } from '@/components/data-table';
import { PERMISSIONS } from '@/constants/permission';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { debounce } from 'lodash';
import { Edit3, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';

type Kategori = { id: number; nama: string };
type Merek = { id: number; nama: string };
type JenisBarang = { id: number; nama: string; kategori?: Kategori; kategori_id?: number };

type ModelBarang = {
    id: number;
    nama: string;
    label: string;
    kategori: Kategori;
    merek: Merek;
    jenis?: JenisBarang;
};

type Props = {
    modelBarang: {
        data: ModelBarang[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    kategori: Kategori[];
    merek: Merek[];
    jenis: JenisBarang[];
    labelList: string[];
    flash?: { message?: string };
    auth: {
        permissions?: string[];
    };
};

export default function Index({ auth, modelBarang, kategori, merek, jenis, flash, labelList, filters }: Props & { filters: { search: string } }) {
    const [editing, setEditing] = useState<ModelBarang | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [labelOptions, setLabelOptions] = useState<string[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [filteredJenis, setFilteredJenis] = useState<JenisBarang[]>([]);
    const [loadingJenis, setLoadingJenis] = useState(false);
    const userPermissions = auth.permissions || [];

    const form = useForm({
        nama: '',
        label: '',
        kategori_id: '',
        merek_id: '',
        jenis_id: '',
    });

    useEffect(() => {
        if (flash?.message) {
            form.reset();
            toast.success(flash.message);
        }
    }, [flash?.message]);

    useEffect(() => {
        if (labelList?.length) {
            setLabelOptions(labelList);
        }
    }, [labelList]);

    // Cascade filter: load Jenis berdasarkan Kategori yang dipilih
    const fetchJenisByKategori = useCallback(async (kategoriId: string) => {
        if (!kategoriId) {
            setFilteredJenis([]);
            return;
        }

        setLoadingJenis(true);
        try {
            const response = await axios.get('/api/jenis-by-kategori', {
                params: { kategori_id: kategoriId },
            });
            setFilteredJenis(response.data);
        } catch (error) {
            console.error('Error fetching jenis:', error);
            setFilteredJenis([]);
        } finally {
            setLoadingJenis(false);
        }
    }, []);

    // Watch kategori_id changes untuk cascade filter
    useEffect(() => {
        if (form.data.kategori_id) {
            fetchJenisByKategori(form.data.kategori_id);
        } else {
            setFilteredJenis([]);
        }
    }, [form.data.kategori_id, fetchJenisByKategori]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.data.label && !labelOptions.includes(form.data.label)) {
            setLabelOptions((prev) => [...prev, form.data.label]);
        }

        if (editing) {
            form.put(`/model/${editing.id}`, {
                onSuccess: () => {
                    form.reset();
                    setEditing(null);
                    setShowForm(false);
                },
            });
        } else {
            form.post('/model', {
                onSuccess: () => {
                    form.reset();
                    setShowForm(false);
                },
            });
        }
    };

    const canCreateModel = userPermissions.includes(PERMISSIONS.CREATE_MODEL);
    const canEditModel = userPermissions.includes(PERMISSIONS.EDIT_MODEL);
    const canDeleteModel = userPermissions.includes(PERMISSIONS.DELETE_MODEL);

    const handleEdit = (item: ModelBarang) => {
        form.setData({
            nama: item.nama,
            label: item.label,
            kategori_id: item.kategori.id.toString(),
            merek_id: item.merek.id.toString(),
            jenis_id: item.jenis?.id ? item.jenis.id.toString() : '',
        });
        // Set filtered jenis untuk edit mode
        if (item.kategori?.id) {
            fetchJenisByKategori(item.kategori.id.toString());
        }
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus model ini?')) {
            form.delete(`/model/${id}`);
        }
    };

    const handleCancel = () => {
        form.reset();
        setEditing(null);
        setShowForm(false);
        setFilteredJenis([]);
    };

    const handleKategoriChange = (newKategoriId: string) => {
        form.setData((data) => ({
            ...data,
            kategori_id: newKategoriId,
            jenis_id: '', // Reset jenis when kategori changes
        }));
    };

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get(
                route('model.index'),
                { search: value },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400),
        [],
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const columns: Column<ModelBarang>[] = [
        {
            header: 'Model Barang',
            accessorKey: 'nama',
            cell: (item) => (
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.merek?.nama} {item.nama}
                </div>
            ),
        },
        {
            header: 'Kategori',
            accessorKey: 'kategori',
            cell: (item) => item.kategori?.nama,
        },
        {
            header: 'Jenis',
            accessorKey: 'jenis',
            cell: (item) => item.jenis?.nama || '-',
        },
        {
            header: 'Label',
            accessorKey: 'label',
            cell: (item) =>
                item.label ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {item.label}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                ),
        },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <Head title="Model Barang" />
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Model Barang</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola daftar model barang, kategori, dan jenis.</p>
                        </div>
                    </div>

                    {showForm && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {editing ? 'Edit Model' : 'Tambah Model Baru'}
                                </h2>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium dark:text-gray-200">Nama Model</label>
                                    <input
                                        type="text"
                                        value={form.data.nama}
                                        onChange={(e) => form.setData('nama', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        required
                                    />
                                    {form.errors.nama && <p className="text-sm text-red-500">{form.errors.nama}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium dark:text-gray-200">Kategori</label>
                                    <select
                                        value={form.data.kategori_id}
                                        onChange={(e) => handleKategoriChange(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {kategori.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.kategori_id && <p className="text-sm text-red-500">{form.errors.kategori_id}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium dark:text-gray-200">Merek</label>
                                    <select
                                        value={form.data.merek_id}
                                        onChange={(e) => form.setData('merek_id', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Pilih Merek</option>
                                        {merek.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.merek_id && <p className="text-sm text-red-500">{form.errors.merek_id}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium dark:text-gray-200">
                                        Jenis Barang
                                        {loadingJenis && <span className="ml-2 text-gray-400">(memuat...)</span>}
                                        {!form.data.kategori_id && <span className="ml-2 text-xs text-gray-400">(pilih kategori dulu)</span>}
                                    </label>
                                    <select
                                        value={form.data.jenis_id}
                                        onChange={(e) => form.setData('jenis_id', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                                        disabled={!form.data.kategori_id || loadingJenis}
                                    >
                                        <option value="">
                                            {!form.data.kategori_id
                                                ? '-- Pilih Kategori terlebih dahulu --'
                                                : filteredJenis.length === 0
                                                  ? 'Tidak ada jenis untuk kategori ini'
                                                  : 'Pilih Jenis Barang'}
                                        </option>
                                        {filteredJenis.map((j) => (
                                            <option key={j.id} value={j.id}>
                                                {j.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.jenis_id && <p className="text-sm text-red-500">{form.errors.jenis_id}</p>}
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium dark:text-gray-200">Label Barang</label>
                                    <Select
                                        options={labelOptions.map((label) => ({ label, value: label }))}
                                        onChange={(selected) => form.setData('label', selected?.value || '')}
                                        value={form.data.label ? { label: form.data.label, value: form.data.label } : null}
                                        isClearable
                                        placeholder="Pilih atau ketik label baru..."
                                    />
                                    {form.errors.label && <p className="text-sm text-red-500">{form.errors.label}</p>}
                                </div>

                                <div className="flex gap-3 md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editing ? 'Simpan Perubahan' : 'Simpan Model'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 hover:text-slate-900"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <DataTable
                        data={modelBarang.data}
                        columns={columns}
                        links={modelBarang.links}
                        searchPlaceholder="Cari model..."
                        onSearch={handleSearch}
                        initialSearch={search}
                        onCreate={
                            canCreateModel
                                ? () => {
                                      setShowForm(true);
                                      setEditing(null);
                                      form.reset();
                                  }
                                : undefined
                        }
                        createLabel="Tambah Model"
                        actionWidth="w-[100px]"
                        actions={(item) => (
                            <div className="flex items-center justify-end gap-2">
                                {canEditModel && (
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="group hover:bg-opacity-100 rounded-full p-2 text-blue-600 transition-all hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                        title="Edit"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                )}
                                {canDeleteModel && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="group hover:bg-opacity-100 rounded-full p-2 text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
