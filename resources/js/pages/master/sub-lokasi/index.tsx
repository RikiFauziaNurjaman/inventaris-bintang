import { Column, DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Edit3, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Lokasi = { id: number; nama: string };
type SubLokasi = {
    id: number;
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
    };
    lokasiList: Lokasi[];
    filters: { search: string; lokasi_id: string };
    flash?: { message?: string };
};

export default function SubLokasiIndex({ subLokasi, lokasiList, filters, flash }: Props) {
    const [editing, setEditing] = useState<SubLokasi | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const form = useForm({
        lokasi_id: '',
        nama: '',
        kode: '',
        lantai: '',
        keterangan: '',
    });

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
            form.reset();
            setEditing(null);
            setShowForm(false);
        }
    }, [flash?.message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/sub-lokasi/${editing.id}`, {
                onSuccess: () => setShowForm(false),
            });
        } else {
            form.post('/sub-lokasi', {
                onSuccess: () => setShowForm(false),
            });
        }
    };

    const handleEdit = (item: SubLokasi) => {
        form.setData({
            lokasi_id: item.lokasi.id.toString(),
            nama: item.nama,
            kode: item.kode || '',
            lantai: item.lantai || '',
            keterangan: item.keterangan || '',
        });
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus sub-lokasi ini?')) {
            form.delete(`/sub-lokasi/${id}`);
        }
    };

    const handleCancel = () => {
        form.reset();
        setEditing(null);
        setShowForm(false);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        debounce(() => {
            router.get(route('sub-lokasi.index'), { search: value, lokasi_id: filters.lokasi_id }, { preserveState: true, replace: true });
        }, 400)();
    };

    // Note: If you want to filter by lokasi_id dynamically with the DataTable,
    // you might need to add a custom filter component in the DataTable or above it.
    // For now, I'll keep the location filter in the page outside DataTable if needed,
    // or just rely on search.
    // However, the previous implementation had a specific dropdown for filters.lokasi_id.
    // I can put that in a slot above or integrated.
    // Simplest is to keep it above the table but below the header.

    const handleLokasiFilter = (lokasiId: string) => {
        router.get(route('sub-lokasi.index'), { search: search, lokasi_id: lokasiId }, { preserveState: true, replace: true });
    };

    const columns: Column<SubLokasi>[] = [
        {
            header: 'Lokasi',
            accessorKey: 'lokasi',
            cell: (item) => item.lokasi?.nama,
        },
        {
            header: 'Sub-Lokasi',
            accessorKey: 'nama',
        },
        {
            header: 'Kode',
            accessorKey: 'kode',
            cell: (item) => item.kode || '-',
        },
        {
            header: 'Lantai',
            accessorKey: 'lantai',
            cell: (item) => item.lantai || '-',
        },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <Head title="Sub-Lokasi" />
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sub-Lokasi</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Kelola lokasi spesifik seperti ruangan, lantai, atau unit.
                            </p>
                        </div>
                    </div>

                    {showForm && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {editing ? 'Edit Sub-Lokasi' : 'Tambah Sub-Lokasi Baru'}
                                </h2>
                                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Lokasi *</label>
                                    <select
                                        value={form.data.lokasi_id}
                                        onChange={(e) => form.setData('lokasi_id', e.target.value)}
                                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Pilih Lokasi</option>
                                        {lokasiList.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Nama Sub-Lokasi *</label>
                                    <input
                                        type="text"
                                        value={form.data.nama}
                                        onChange={(e) => form.setData('nama', e.target.value)}
                                        placeholder="Contoh: Pendaftaran, Poli A"
                                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Kode</label>
                                    <input
                                        type="text"
                                        value={form.data.kode}
                                        onChange={(e) => form.setData('kode', e.target.value)}
                                        placeholder="Contoh: REG, POLI-A"
                                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Lantai</label>
                                    <input
                                        type="text"
                                        value={form.data.lantai}
                                        onChange={(e) => form.setData('lantai', e.target.value)}
                                        placeholder="Contoh: 1, 2, B1"
                                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Keterangan</label>
                                    <input
                                        type="text"
                                        value={form.data.keterangan}
                                        onChange={(e) => form.setData('keterangan', e.target.value)}
                                        placeholder="Keterangan tambahan..."
                                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editing ? 'Simpan Perubahan' : 'Simpan Sub-Lokasi'}
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
                        data={subLokasi.data}
                        columns={columns}
                        links={subLokasi.links}
                        searchPlaceholder="Cari sub-lokasi..."
                        onSearch={handleSearch}
                        initialSearch={search}
                        customFilters={
                            <select
                                value={filters.lokasi_id || ''}
                                onChange={(e) => handleLokasiFilter(e.target.value)}
                                className="h-9 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-[200px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            >
                                <option value="">Semua Lokasi</option>
                                {lokasiList.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.nama}
                                    </option>
                                ))}
                            </select>
                        }
                        onCreate={() => {
                            setShowForm(true);
                            setEditing(null);
                            form.reset();
                        }}
                        createLabel="Tambah Sub-Lokasi"
                        actionWidth="w-[100px]"
                        actions={(item) => (
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="group hover:bg-opacity-100 rounded-full p-2 text-blue-600 transition-all hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    title="Edit"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="group hover:bg-opacity-100 rounded-full p-2 text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
