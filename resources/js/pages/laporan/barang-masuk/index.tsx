import Pagination from '@/components/paginations';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/inertia';
import { Head, router, useForm } from '@inertiajs/react';
import pickBy from 'lodash/pickBy';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useState } from 'react';

interface BarangMasukItem {
    transaksi_id: number;
    tanggal: string;
    asal_barang: string;
    nama_user: string;
    serial_number: string;
    model: string;
    merek: string;
    kategori: string;
}

interface User {
    id: number;
    name: string;
}

interface Paginator<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface LaporanBarangMasukProps extends PageProps {
    auth: { user: User };
    barangMasukData: Paginator<BarangMasukItem>;
    lokasiList: { id: number; nama: string }[];
    filters: {
        start_date?: string;
        end_date?: string;
        lokasi_id?: string;
        search?: string;
    };
}

export default function LaporanBarangMasuk({ auth, barangMasukData, lokasiList, filters }: LaporanBarangMasukProps) {
    const { data, setData, get, reset } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        lokasi_id: filters.lokasi_id || '',
        search: filters.search || '',
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('laporan.masuk'), pickBy(data), { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        reset();
        router.get(route('laporan.masuk'));
    };

    const buildExportUrl = (format = 'excel') => {
        const routeName = format === 'pdf' ? 'laporan.masuk.pdf' : 'laporan.masuk.export';
        const query = pickBy(data);
        if (Object.keys(query).length === 0) return route(routeName);
        return `${route(routeName)}?${new URLSearchParams(query as any).toString()}`;
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    return (
        <AppLayout>
            <Head title="Laporan Barang Masuk" />
            <div className="px-4 py-8 md:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="mb-6 text-2xl font-bold text-gray-800">Laporan Barang Masuk</h1>

                    {/* Form Filter dan Tombol Aksi */}
                    <form onSubmit={applyFilters} className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
                        <div>
                            <label htmlFor="start_date" className="mb-1 block text-sm text-gray-600">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="mb-1 block text-sm text-gray-600">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="lokasi_id" className="mb-1 block text-sm text-gray-600">
                                Lokasi
                            </label>
                            <select
                                id="lokasi_id"
                                name="lokasi_id"
                                value={data.lokasi_id}
                                onChange={(e) => setData('lokasi_id', e.target.value)}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            >
                                <option value="">Semua Lokasi</option>
                                {lokasiList.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="search" className="mb-1 block text-sm text-gray-600">
                                Cari (SN, Model, Merek)
                            </label>
                            <input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Cari..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full rounded border border-gray-300 p-2 text-sm"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="w-full rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Reset
                            </button>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={toggleDropdown}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black">
                                        <div className="py-1">
                                            <a
                                                href={buildExportUrl()}
                                                target="_blank"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                                Excel
                                            </a>
                                            <a
                                                href={buildExportUrl('pdf')}
                                                target="_blank"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <FileText className="mr-2 h-4 w-4 text-red-600" />
                                                PDF
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => window.print()}
                                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Printer className="mr-2 h-4 w-4 text-gray-600" />
                                                Cetak
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Tabel Data */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Info Barang</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asal Barang</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penerima</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {barangMasukData.data.length > 0 ? (
                                        barangMasukData.data.map((item: BarangMasukItem, index) => (
                                            <tr key={item.transaksi_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {(barangMasukData.current_page - 1) * barangMasukData.per_page + (index + 1)}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{item.serial_number || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.model} / {item.merek} / {item.kategori}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">{item.asal_barang}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">{item.nama_user}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                Tidak ada data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {barangMasukData.data.length > 0 && <div className="border-t p-4">{<Pagination links={barangMasukData.links} />}</div>}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
