import { Column, DataTable } from '@/components/data-table';
import { PERMISSIONS } from '@/constants/permission';
import AppLayout from '@/layouts/app-layout';
import { Menu, Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon, Eye, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import DetailBarangMasukModal from './barang-masuk-detail';

interface BarangMasukItem {
    id: number;
    merek?: string;
    model?: string;
    kategori?: string;
    asal_barang?: string;
    tanggal?: string;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout>;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    } as T;
}

export default function BarangMasukIndex() {
    const { auth, filters, barangMasuk, kategoriOptions, asalOptions, merekOptions } = usePage().props as any;
    const items = barangMasuk.data || barangMasuk;
    const links = barangMasuk.links || [];
    const userPermissions = auth.permissions || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBarang, setSelectedBarang] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true); // Default open for better visibility based on requirement

    const { data, setData, reset } = useForm({
        tanggal: filters?.tanggal || '',
        kategori_id: filters?.kategori_id || '',
        asal_barang_id: filters?.asal_barang_id || '',
        merek: filters?.merek || '',
        search: filters?.search || '',
        sort_by: filters?.sort_by || 'desc',
        per_page: filters?.per_page || 10,
        page: filters?.page || 1,
    });

    const openDetailModal = (item: BarangMasukItem) => {
        fetch(route('barang-masuk.show', item.id), {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                setSelectedBarang(data.barangMasuk);
                setIsModalOpen(true);
            })
            .catch((error) => {
                console.error('Gagal mengambil data detail:', error);
            });
    };

    const debouncedFilter = useCallback(() => {
        const debouncedFn = debounce(() => {
            router.get(route('barang-masuk.index'), data, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 400);
        debouncedFn();
    }, [data]);

    useEffect(() => {
        debouncedFilter();
    }, [data.tanggal, data.kategori_id, data.asal_barang_id, data.merek, data.search, data.sort_by, data.per_page, debouncedFilter]);

    const canCreateBarangMasuk = userPermissions.includes(PERMISSIONS.CREATE_BARANG_MASUK);
    const canEditBarangMasuk = userPermissions.includes(PERMISSIONS.EDIT_BARANG_MASUK);

    const columns: Column<BarangMasukItem>[] = [
        {
            header: 'Tanggal',
            accessorKey: 'tanggal',
            className: 'w-[150px]',
        },
        {
            header: 'Merek & Model',
            cell: (item) => (
                <div className="font-medium text-slate-900 dark:text-white">
                    {item.merek} {item.model}
                </div>
            ),
        },
        {
            header: 'Kategori',
            accessorKey: 'kategori',
        },
        {
            header: 'Asal Barang',
            accessorKey: 'asal_barang',
        },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 dark:bg-zinc-950">
                {/* Header Section */}
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Barang Masuk</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daftar barang masuk inventory dan riwayatnya.</p>
                        </div>
                        {canCreateBarangMasuk && (
                            <Link
                                href="/barang-masuk/create"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Tambah Barang Masuk
                            </Link>
                        )}
                    </div>

                    {/* Filter Section - Separate Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="inline-block rounded bg-slate-100 px-2 py-1 text-sm font-semibold tracking-wide text-slate-900 dark:bg-zinc-800 dark:text-white">
                                    FILTERS
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
                            >
                                {isFilterOpen ? (
                                    <>
                                        <ChevronUpIcon className="h-4 w-4" />
                                        <span className="sr-only">Sembunyikan</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDownIcon className="h-4 w-4" />
                                        <span className="sr-only">Tampilkan</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {isFilterOpen && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal Transaksi</label>
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Kategori</label>
                                    <select
                                        value={data.kategori_id}
                                        onChange={(e) => setData('kategori_id', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {kategoriOptions.map((k: any) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Asal Barang</label>
                                    <select
                                        value={data.asal_barang_id}
                                        onChange={(e) => setData('asal_barang_id', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="">Semua Asal</option>
                                        {asalOptions.map((a: any) => (
                                            <option key={a.id} value={a.id}>
                                                {a.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Merek</label>
                                    <select
                                        value={data.merek}
                                        onChange={(e) => setData('merek', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="">Semua Merek</option>
                                        {merekOptions.map((merek: any) => (
                                            <option key={merek.id} value={merek.nama}>
                                                {merek.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Urutkan</label>
                                    <select
                                        value={data.sort_by}
                                        onChange={(e) => setData('sort_by', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="desc">Terbaru</option>
                                        <option value="asc">Terlama</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Tampilan</label>
                                    <select
                                        value={data.per_page}
                                        onChange={(e) => {
                                            setData('per_page', e.target.value);
                                            setData('page', 1);
                                        }}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="10">10 Data</option>
                                        <option value="25">25 Data</option>
                                        <option value="50">50 Data</option>
                                        <option value="100">100 Data</option>
                                    </select>
                                </div>

                                <div className="flex items-end sm:col-span-2 lg:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            router.get(route('barang-masuk.index'));
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table Section */}
                    <DataTable
                        data={items}
                        columns={columns}
                        links={links}
                        searchPlaceholder="Cari serial, brand, model..."
                        initialSearch={data.search}
                        onSearch={(val) => setData('search', val)}
                        actionWidth="w-[100px]"
                        actions={(item) => (
                            <div className="flex justify-center">
                                <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 hover:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:text-slate-300">
                                        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none dark:bg-zinc-900 dark:ring-zinc-800">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => openDetailModal(item)}
                                                        className={`${
                                                            active
                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'text-slate-700 dark:text-slate-300'
                                                        } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Lihat Detail
                                                    </button>
                                                )}
                                            </Menu.Item>

                                            {canEditBarangMasuk && (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('barang-masuk.edit', { barang_masuk: item.id })}
                                                            className={`${
                                                                active
                                                                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                                    : 'text-slate-700 dark:text-slate-300'
                                                            } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                            Edit Data
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            )}

                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                router.delete(route('barang-masuk.destroy', item.id));
                                                            }
                                                        }}
                                                        className={`${
                                                            active
                                                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                : 'text-red-600 dark:text-red-400'
                                                        } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        Hapus Data
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        )}
                    />
                </div>
                <DetailBarangMasukModal show={isModalOpen} onClose={() => setIsModalOpen(false)} barang={selectedBarang} />
            </div>
        </AppLayout>
    );
}
