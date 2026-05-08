import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Boxes, ChevronDown, ChevronUp, Filter, MapPin, Package, Printer, Search, Wrench } from 'lucide-react';
import { useState } from 'react';

type SubLokasi = { id: number; nama: string; kode: string | null; lantai: string | null };
type Kategori = { id: number; nama: string };

type BarangItem = {
    id: number;
    serial_number: string;
    status: 'baik' | 'rusak' | 'diperbaiki';
    pic: string | null;
    catatan: string | null;
    kondisi_awal: string | null;
    sub_lokasi: SubLokasi | null;
    rak: { id: number; kode_rak: string } | null;
    asal: { id: number; nama: string } | null;
    jenis_barang: { id: number; nama: string } | null;
    model_barang: {
        id: number;
        nama: string;
        label: string | null;
        merek: { id: number; nama: string } | null;
        kategori: { id: number; nama: string } | null;
        jenis: { id: number; nama: string } | null;
    } | null;
};

type ModelSummaryItem = {
    model_id: number;
    model_nama: string;
    merek_nama: string;
    total: number;
    baik: number;
    rusak: number;
    diperbaiki: number;
};

type Props = {
    lokasi: { id: number; nama: string; alamat: string | null };
    barang: {
        data: BarangItem[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: { total: number; baik: number; rusak: number; diperbaiki: number };
    modelSummary: ModelSummaryItem[];
    subLokasiList: SubLokasi[];
    kategoriList: Kategori[];
    filters: { sub_lokasi_id: string; status: string; kategori_id: string; search: string };
};

export default function LokasiDetail({ lokasi, barang, stats, modelSummary, subLokasiList, kategoriList, filters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showSummary, setShowSummary] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    const handleFilter = (field: string, value: string) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        router.get(route('monitoring.lokasi.detail', lokasi.id), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const emptyFilters = { sub_lokasi_id: '', status: '', kategori_id: '', search: '' };
        setLocalFilters(emptyFilters);
        router.get(route('monitoring.lokasi.detail', lokasi.id), emptyFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const hasActiveFilter = localFilters.search || localFilters.sub_lokasi_id || localFilters.status || localFilters.kategori_id;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'baik':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Package size={11} /> Baik
                    </span>
                );
            case 'rusak':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle size={11} /> Rusak
                    </span>
                );
            case 'diperbaiki':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Wrench size={11} /> Diperbaiki
                    </span>
                );
            default:
                return <span className="text-xs text-gray-500">{status}</span>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Lokasi — ${lokasi.nama}`} />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header + Breadcrumb */}
                    <div>
                        <Link
                            href={route('monitoring.index')}
                            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Monitoring
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{lokasi.nama}</h1>
                                {lokasi.alamat && <p className="text-sm text-gray-500 dark:text-gray-400">{lokasi.alamat}</p>}
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const queryParams = new URLSearchParams(filters as any).toString();
                                        window.open(`${route('monitoring.lokasi.exportPdf', lokasi.id)}?${queryParams}`, '_blank');
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
                                >
                                    <Printer size={16} />
                                    Ekspor PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Boxes size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Unit</div>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-emerald-900/50 dark:from-emerald-900/20 dark:to-green-900/10">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                    <Package size={16} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.baik}</div>
                            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Kondisi Baik</div>
                        </div>
                        <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-red-900/50 dark:from-red-900/20 dark:to-rose-900/10">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rusak}</div>
                            <div className="text-xs font-medium text-red-600 dark:text-red-500">Rusak</div>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-amber-900/50 dark:from-amber-900/20 dark:to-yellow-900/10">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <Wrench size={16} className="text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.diperbaiki}</div>
                            <div className="text-xs font-medium text-amber-600 dark:text-amber-500">Dalam Perbaikan</div>
                        </div>
                    </div>

                    {/* Model Summary — Collapsible */}
                    {modelSummary.length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            <button
                                onClick={() => setShowSummary(!showSummary)}
                                className="flex w-full items-center justify-between px-5 py-4 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Boxes size={18} className="text-indigo-500" />
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Ringkasan per Model Barang</h2>
                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {modelSummary.length} model
                                    </span>
                                </div>
                                {showSummary ? (
                                    <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={18} className="text-gray-400" />
                                )}
                            </button>
                            {showSummary && (
                                <div className="border-t border-gray-100 px-5 pb-5 dark:border-zinc-800">
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {modelSummary.map((m) => (
                                            <div
                                                key={m.model_id}
                                                className="rounded-lg border border-gray-100 bg-gray-50/50 p-3.5 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                                            >
                                                <div className="mb-2">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {m.merek_nama} {m.model_nama}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {m.total} unit
                                                    </span>
                                                    {m.baik > 0 && (
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">{m.baik} baik</span>
                                                    )}
                                                    {m.rusak > 0 && <span className="text-xs text-red-600 dark:text-red-400">{m.rusak} rusak</span>}
                                                    {m.diperbaiki > 0 && (
                                                        <span className="text-xs text-amber-600 dark:text-amber-400">{m.diperbaiki} perbaiki</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter Bar */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex w-full items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Filter size={16} />
                                Filter & Pencarian
                                {hasActiveFilter && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                            </div>
                            {isFilterOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                        {isFilterOpen && (
                            <div className="border-t border-gray-100 px-5 pt-3 pb-4 dark:border-zinc-800">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari serial number, PIC..."
                                            value={localFilters.search || ''}
                                            onChange={(e) => handleFilter('search', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                        />
                                    </div>

                                    {/* Sub-Lokasi */}
                                    <select
                                        value={localFilters.sub_lokasi_id || ''}
                                        onChange={(e) => handleFilter('sub_lokasi_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    >
                                        <option value="">Semua Sub-Lokasi</option>
                                        {subLokasiList.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nama} {s.lantai ? `(Lt. ${s.lantai})` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Status */}
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
                                {hasActiveFilter && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Hapus semua filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Data Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                                <thead className="bg-slate-50 dark:bg-zinc-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Serial Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Merek & Model
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Jenis
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Sub-Lokasi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            PIC
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Kondisi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Catatan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {barang.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center">
                                                <Package className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                                <p className="font-medium text-gray-500 dark:text-gray-400">Tidak ada data barang</p>
                                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                    {hasActiveFilter ? 'Coba ubah filter atau hapus pencarian' : 'Belum ada barang di lokasi ini'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        barang.data.map((item, index) => (
                                            <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-sm font-semibold text-gray-900 dark:bg-zinc-800 dark:text-white">
                                                        {item.serial_number}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.model_barang?.merek?.nama} {item.model_barang?.nama}
                                                    </div>
                                                    {item.model_barang?.label && (
                                                        <span className="mt-0.5 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {item.model_barang.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {item.model_barang?.kategori?.nama || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {item.model_barang?.jenis?.nama || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.sub_lokasi ? (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {item.sub_lokasi.nama}
                                                            </div>
                                                            {item.sub_lokasi.lantai && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Lt. {item.sub_lokasi.lantai}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900 dark:text-white">{item.pic || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                                                <td className="max-w-[200px] px-4 py-3">
                                                    <span className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                        {item.catatan || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {barang.links && barang.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan {barang.data.length} dari {barang.total} unit
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {barang.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
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
