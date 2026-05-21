import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import debounce from 'lodash.debounce'; // Install lodash jika belum
import { useCallback, useState } from 'react';

export default function BarangIndex() {
    const { barangList, filters, filterOptions } = usePage().props as any;

    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || '');
    const [jenis, setJenis] = useState(filters.jenis || '');
    const [lokasi, setLokasi] = useState(filters.lokasi || '');
    const [status, setStatus] = useState(filters.status || '');
    const [kondisi, setKondisi] = useState(filters.kondisi || '');

    const debouncedSearch = useCallback(
        debounce((nextValue) => {
            const query = {
                search: nextValue,
                kategori,
                jenis,
                lokasi,
                status,
                kondisi,
            };
            router.get(route('total-stock.index'), query, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 400),
        [kategori, jenis, lokasi, status, kondisi],
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearch(value);
        debouncedSearch(value);
    };

    const updateFilter = (key: string, value: string) => {
        const query = {
            search,
            kategori,
            jenis,
            lokasi,
            status,
            kondisi,
            [key]: value,
        };

        router.get(route('total-stock.index'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setKategori('');
        setJenis('');
        setLokasi('');
        setStatus('');
        setKondisi('');

        router.get(
            route('total-stock.index'),
            {},
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (id: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            router.delete(route('total-stock.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleUpdateKondisi = (id: any, newKondisi: string) => {
        if (confirm(`Apakah Anda yakin ingin mengubah kondisi barang ini menjadi ${newKondisi}?`)) {
            router.patch(
                route('total-stock.updateKondisi', id),
                { kondisi: newKondisi },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleExportPdf = () => {
        const queryParams = {
            search,
            kategori,
            jenis,
            lokasi,
            status,
            kondisi,
        };

        const activeFilters = Object.fromEntries(Object.entries(queryParams).filter(([, value]) => value));

        const queryString = new URLSearchParams(activeFilters).toString();

        const url = `${route('total-stock.exportPdf')}?${queryString}`;

        window.open(url, '_blank');
    };

    const getKondisiStyle = (kondisi: any) => {
        switch (kondisi?.toLowerCase()) {
            case 'baru':
                return 'bg-green-100 text-green-800 font-semibold';
            case 'second':
                return 'bg-yellow-100 text-yellow-800 font-semibold';
            default:
                return '';
        }
    };

    const getStatusStyle = (status: any) => {
        switch (status?.toLowerCase()) {
            case 'bagus':
                return 'bg-green-100 text-green-800 font-semibold';
            case 'rusak':
                return 'bg-red-100 text-red-800 font-semibold';
            case 'diperbaiki':
                return 'bg-yellow-100 text-yellow-800 font-semibold';
            case 'dipinjamkan':
                return 'bg-blue-100 text-blue-800 font-semibold';
            case 'dimusnahkan':
                return 'bg-purple-100 text-purple-800 font-semibold';
            case 'dijual':
                return 'bg-orange-100 text-orange-800 font-semibold';
            case 'menunggu':
                return 'bg-gray-100 text-gray-800 font-semibold';
            default:
                return '';
        }
    };

    return (
        <AppLayout>
            <div className="p-3">
                <h1 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Daftar Barang</h1>

                {/* 🔍 Filter Section */}
                <div className="mb-3 flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="Cari barang..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-40 rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <select
                        value={kategori}
                        onChange={(e) => {
                            setKategori(e.target.value);
                            updateFilter('kategori', e.target.value);
                        }}
                        className="rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="">Semua Kategori</option>
                        {filterOptions.kategoriList.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        value={jenis}
                        onChange={(e) => {
                            setJenis(e.target.value);
                            updateFilter('jenis', e.target.value);
                        }}
                        className="rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="">Semua Jenis</option>
                        {filterOptions.jenisList?.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        value={lokasi}
                        onChange={(e) => {
                            setLokasi(e.target.value);
                            updateFilter('lokasi', e.target.value);
                        }}
                        className="rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="">Semua Lokasi</option>
                        {filterOptions.lokasiList.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            updateFilter('status', e.target.value);
                        }}
                        className="rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="">Semua Status</option>
                        {filterOptions.statusList.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        value={kondisi}
                        onChange={(e) => {
                            setKondisi(e.target.value);
                            updateFilter('kondisi', e.target.value);
                        }}
                        className="rounded border px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="">Semua Kondisi</option>
                        {filterOptions.kondisiList.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        Ekspor PDF
                    </button>
                </div>

                {/* 📋 Table */}
                <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100 text-left dark:bg-zinc-800">
                        <tr>
                            <th className="border px-2 py-1">No</th>
                            <th className="border px-3 py-1">Serial Number</th>
                            <th className="border px-3 py-1">Nama</th>
                            <th className="border px-3 py-1">Merek + Model</th>
                            <th className="border px-3 py-1">Kategori</th>
                            <th className="border px-3 py-1">Jenis</th>
                            <th className="border px-3 py-1">Rak</th>
                            <th className="border px-2 py-1">Kode Rak</th>
                            <th className="border px-3 py-1">Baris</th>
                            <th className="border px-3 py-1">Status</th>
                            <th className="border px-3 py-1">Kondisi</th>
                            <th className="border px-3 py-1">Lokasi</th>
                            <th className="border px-3 py-1">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {barangList.data.map((item, index) => (
                            <tr key={item.id} className="dark:bg-zinc-900">
                                <td className="border px-2 py-1">{index + 1 + barangList.from - 1}</td>
                                <td className="border px-3 py-1">{item.serial_number}</td>
                                <td className="border px-3 py-1">{item.label}</td>
                                <td className="border px-3 py-1">{item.merek_model}</td>
                                <td className="border px-3 py-1">{item.kategori}</td>
                                <td className="border px-3 py-1">{item.jenis}</td>
                                <td className="border px-3 py-1">{item.nama_rak}</td>
                                <td className="border px-2 py-1">{item.kode_rak}</td>
                                <td className="border px-3 py-1">{item.baris}</td>
                                <td className={`border px-3 py-1 ${getStatusStyle(item.status_awal)}`}>{item.status_awal}</td>
                                <td className={`border px-3 py-1 ${getKondisiStyle(item.kondisi)}`}>{item.kondisi}</td>
                                <td className="border px-3 py-1">{item.lokasi}</td>
                                <td className="border px-3 py-1">
                                    <div className="flex gap-1">
                                        {item.kondisi?.toLowerCase() === 'baru' ? (
                                            <button
                                                onClick={() => handleUpdateKondisi(item.id, 'second')}
                                                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                                title="Ubah ke Second"
                                            >
                                                Second
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpdateKondisi(item.id, 'baru')}
                                                className="rounded bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                                title="Ubah ke Baru"
                                            >
                                                Baru
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 📑 Pagination */}
                <div className="mt-3 flex justify-center gap-1">
                    {barangList.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            className={`rounded border px-2 py-1 text-sm ${
                                link.active ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
                            } ${!link.url ? 'pointer-events-none text-gray-400 dark:text-gray-500' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
