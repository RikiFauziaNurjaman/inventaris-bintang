import { Column, DataTable } from '@/components/data-table';
import { PERMISSIONS } from '@/constants/permission';
import AppLayout from '@/layouts/app-layout';
import { Menu, Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import BarangKembaliDetailModal from './BarangKembaliDetail';

interface KategoriOption {
    id: number;
    nama: string;
}

interface LokasiOption {
    id: number;
    nama: string;
}

interface Barang {
    model_barang: {
        nama: string;
        merek: { nama: string };
        kategori: { nama: string };
    };
}

interface BarangKembaliDetail {
    id: number;
    barang: Barang;
    status_saat_kembali: string;
}

interface BarangKembali {
    id: number;
    tanggal: string;
    lokasi: { nama: string };
    details: BarangKembaliDetail[];
    serial_number?: string;
    merek?: string;
    model?: string;
    kategori?: string;
    kondisi?: string;
}

interface PageProps {
    filters: {
        tanggal?: string;
        kategori_id?: string;
        lokasi_id?: string;
        sort?: 'terbaru' | 'terlama';
        per_page?: number | string;
        search?: string;
    };
    barangKembali: {
        data: BarangKembali[];
        from: number;
        to: number;
        total: number;
        links: any[];
    };
    kategoriOptions: KategoriOption[];
    lokasiOptions: LokasiOption[];
    auth: {
        permissions?: string[];
    };
}

export default function BarangKembaliIndex() {
    const { auth, filters, barangKembali, kategoriOptions, lokasiOptions } = usePage<PageProps>().props;
    const userPermissions = auth.permissions || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    const items = barangKembali.data || [];
    const links = barangKembali.links || [];

    // Fungsi untuk membuka modal
    const handleOpenDetailModal = (transaksi) => {
        setSelectedItem(transaksi);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleEdit = (id: any) => {
        router.get(`/barang-kembali/${id}/edit`);
    };

    // 2. TAMBAHKAN SEMUA FILTER KE USEFORM
    const { data, setData, reset } = useForm({
        tanggal: filters?.tanggal || '',
        kategori_id: filters?.kategori_id || '',
        lokasi_id: filters?.lokasi_id || '',
        search: filters?.search || '',
        sort: filters?.sort || 'terbaru',
        per_page: filters?.per_page || 10,
    });

    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route('barang-kembali.index'),
                { ...data, search: query },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400),
        [data],
    );

    const handleFilter = useCallback(() => {
        router.get(route('barang-kembali.index'), data, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [data]);

    const debouncedFilter = useCallback(
        debounce(() => {
            router.get(route('barang-kembali.index'), data, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 400),
        [data],
    );

    // useEffect untuk filter otomatis
    useEffect(() => {
        debouncedFilter();
    }, [data.tanggal, data.kategori_id, data.lokasi_id, data.sort, data.per_page, data.search, debouncedFilter]);

    const canCreateBarangKembali = userPermissions.includes(PERMISSIONS.CREATE_BARANG_KEMBALI);
    const canEditBarangKembali = userPermissions.includes(PERMISSIONS.EDIT_BARANG_KEMBALI);
    const canDeleteBarangKembali = userPermissions.includes(PERMISSIONS.DELETE_BARANG_KEMBALI);

    const columns: Column<BarangKembali>[] = [
        {
            header: 'Tanggal',
            accessorKey: 'tanggal',
            className: 'w-[150px]',
        },
        {
            header: 'Merek/Model',
            cell: (item) => {
                const firstItem = item.details && item.details.length > 0 ? item.details[0] : null;
                return (
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                            {firstItem?.barang?.model_barang?.merek?.nama || ''} {firstItem?.barang?.model_barang?.nama || '(Tidak ada barang)'}
                        </div>
                        {item.details.length > 1 && <span className="text-[10px] text-slate-500 italic">(+{item.details.length - 1} lainnya)</span>}
                    </div>
                );
            },
        },
        {
            header: 'Kategori',
            cell: (item) => {
                const firstItem = item.details && item.details.length > 0 ? item.details[0] : null;
                return firstItem?.barang?.model_barang?.kategori?.nama || '-';
            },
        },
        {
            header: 'Asal Lokasi',
            cell: (item) => item.lokasi?.nama || '-',
        },
        {
            header: 'Kondisi',
            cell: (item) => {
                const firstItem = item.details && item.details.length > 0 ? item.details[0] : null;
                return (
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            firstItem?.status_saat_kembali === 'bagus'
                                ? 'bg-green-100 text-green-800'
                                : firstItem?.status_saat_kembali === 'rusak'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {firstItem?.status_saat_kembali || '-'}
                    </span>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 dark:bg-zinc-950">
                {/* Header Section */}
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Barang Kembali</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daftar barang yang kembali ke inventori</p>
                        </div>
                        {canCreateBarangKembali && (
                            <Link
                                href="/barang-kembali/create"
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Tambah Barang Kembali
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
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal</label>
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
                                        {kategoriOptions.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Lokasi Asal</label>
                                    <select
                                        value={data.lokasi_id}
                                        onChange={(e) => setData('lokasi_id', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="">Semua Lokasi</option>
                                        {lokasiOptions.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Urutkan</label>
                                    <select
                                        value={data.sort}
                                        onChange={(e) => setData('sort', e.target.value as 'terbaru' | 'terlama')}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="terbaru">Terbaru</option>
                                        <option value="terlama">Terlama</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Item per Halaman</label>
                                    <select
                                        value={data.per_page}
                                        onChange={(e) => setData('per_page', e.target.value)}
                                        className="block w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value={10}>10 Data</option>
                                        <option value={25}>25 Data</option>
                                        <option value={50}>50 Data</option>
                                        <option value={100}>100 Data</option>
                                    </select>
                                </div>

                                <div className="flex items-end sm:col-span-1 lg:col-span-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            router.get(route('barang-kembali.index'));
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
                                                        onClick={() => handleOpenDetailModal(item)}
                                                        className={`${
                                                            active
                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'text-slate-700 dark:text-slate-300'
                                                        } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                        Lihat Detail
                                                    </button>
                                                )}
                                            </Menu.Item>

                                            {canEditBarangKembali && (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleEdit(item.id)}
                                                            className={`${
                                                                active
                                                                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                                    : 'text-slate-700 dark:text-slate-300'
                                                            } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                            Edit Data
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            )}

                                            {canDeleteBarangKembali && (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                                                                    router.delete(route('barang-kembali.destroy', item.id));
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
                                            )}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        )}
                    />
                </div>
            </div>
            <BarangKembaliDetailModal show={isModalOpen} onClose={handleCloseModal} barangKembali={selectedItem} />
        </AppLayout>
    );
}
