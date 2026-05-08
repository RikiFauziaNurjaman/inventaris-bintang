import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Filter, MapPin, Package, Search, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

type LokasiGroup = {
    id: number;
    nama: string;
    models: string[];
    jumlah: number;
};

type Props = {
    lokasiPaginated: {
        data: LokasiGroup[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        current_page: number;
        per_page: number;
    };
    lokasiList: { id: number; nama: string }[];
    subLokasiList: { id: number; nama: string; lokasi_id: number }[];
    kategoriList: { id: number; nama: string }[];
    filters: {
        lokasi_id: string;
        sub_lokasi_id: string;
        status: string;
        kategori_id: string;
    };
    stats: {
        total: number;
        baik: number;
        rusak: number;
        diperbaiki: number;
        terdistribusi: number;
    };
};

export default function MonitoringIndex({ lokasiPaginated, lokasiList, subLokasiList, kategoriList, filters, stats }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [filteredSubLokasi, setFilteredSubLokasi] = useState(subLokasiList);

    useEffect(() => {
        if (localFilters.lokasi_id) {
            setFilteredSubLokasi(subLokasiList.filter((s) => s.lokasi_id === parseInt(localFilters.lokasi_id)));
        } else {
            setFilteredSubLokasi(subLokasiList);
        }
    }, [localFilters.lokasi_id, subLokasiList]);

    const handleFilter = (field: string, value: string) => {
        const newFilters = { ...localFilters, [field]: value };

        // Reset sub_lokasi if lokasi changes
        if (field === 'lokasi_id') {
            newFilters.sub_lokasi_id = '';
        }

        setLocalFilters(newFilters);
        router.get(route('monitoring.index'), newFilters, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        const emptyFilters = { lokasi_id: '', sub_lokasi_id: '', status: '', kategori_id: '' };
        setLocalFilters(emptyFilters);
        router.get(route('monitoring.index'), emptyFilters, { preserveState: true, replace: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'baik':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Package size={12} /> Baik
                    </span>
                );
            case 'rusak':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle size={12} /> Rusak
                    </span>
                );
            case 'diperbaiki':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Wrench size={12} /> Diperbaiki
                    </span>
                );
            default:
                return <span className="text-xs text-gray-500">{status}</span>;
        }
    };

    return (
        <AppLayout>
            <Head title="Monitoring Barang" />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoring Barang</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pantau lokasi dan kondisi setiap unit barang</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Unit</div>
                        </div>
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.baik}</div>
                            <div className="text-sm text-green-600 dark:text-green-500">Kondisi Baik</div>
                        </div>
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rusak}</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Rusak</div>
                        </div>
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm dark:border-yellow-900/50 dark:bg-yellow-900/20">
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.diperbaiki}</div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-500">Dalam Perbaikan</div>
                        </div>
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900/50 dark:bg-blue-900/20">
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.terdistribusi}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-500">Terdistribusi</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Filter size={16} />
                            Filter
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Lokasi */}
                            <select
                                value={localFilters.lokasi_id || ''}
                                onChange={(e) => handleFilter('lokasi_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="">Semua Lokasi</option>
                                {lokasiList.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.nama}
                                    </option>
                                ))}
                            </select>

                            {/* Sub-Lokasi */}
                            <select
                                value={localFilters.sub_lokasi_id || ''}
                                onChange={(e) => handleFilter('sub_lokasi_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                disabled={!localFilters.lokasi_id}
                            >
                                <option value="">Semua Sub-Lokasi</option>
                                {filteredSubLokasi.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nama}
                                    </option>
                                ))}
                            </select>

                            {/* Status/Kondisi */}
                            <select
                                value={localFilters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="">Semua Kondisi</option>
                                <option value="baik">Baik</option>
                                <option value="rusak">Rusak</option>
                                <option value="diperbaiki">Dalam Perbaikan</option>
                            </select>

                            {/* Kategori */}
                            <select
                                value={localFilters.kategori_id || ''}
                                onChange={(e) => handleFilter('kategori_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="">Semua Kategori</option>
                                {kategoriList.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear filters button */}
                        {(localFilters.lokasi_id ||
                            localFilters.sub_lokasi_id ||
                            localFilters.status ||
                            localFilters.kategori_id) && (
                            <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400">
                                Hapus semua filter
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                                <thead className="bg-gray-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Lokasi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Nama Barang
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {lokasiPaginated.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                                <Package className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium">Tidak ada data</p>
                                                <p className="text-xs">Coba ubah filter</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        lokasiPaginated.data.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm align-top text-gray-500 dark:text-gray-400">
                                                    {(lokasiPaginated.current_page - 1) * lokasiPaginated.per_page + index + 1}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        {item.nama}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm text-gray-900 dark:text-white">
                                                    {item.models.length > 0 ? (
                                                        item.models.map((model, idx) => (
                                                            <div key={idx} className="mb-1">{model}</div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top text-center">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{item.jumlah}</span>
                                                </td>
                                                <td className="px-4 py-3 align-top text-center">
                                                    <Link
                                                        href={route('monitoring.lokasi.detail', item.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        title="Lihat detail lokasi"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Detail Lokasi
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {lokasiPaginated.links && lokasiPaginated.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan {lokasiPaginated.data.length} dari {lokasiPaginated.total} lokasi
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {lokasiPaginated.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
