import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

interface Item {
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    nama_barang: string;
    jumlah_rusak: number;
}

interface DetailItem {
    id: number;
    serial_number: string;
}

interface Props {
    stokRusak: Item[];
}

export default function Index({ stokRusak }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [detailItems, setDetailItems] = useState<DetailItem[]>([]);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [alasan, setAlasan] = useState('');

    const handleOpenModal = async (item: Item) => {
        setCurrentItem(item);
        setIsLoading(true);
        setIsModalOpen(true);

        try {
            const response = await axios.get(route('stock.rusak.show'), {
                params: {
                    model_id: item.model_id,
                    lokasi_id: item.lokasi_id,
                },
            });
            setDetailItems(response.data);
        } catch (error) {
            console.error('Gagal mengambil detail barang:', error);
            handleCloseModal();
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk menutup modal dan mereset state
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setDetailItems([]);
        setSelectedIds([]);
        setAlasan('');
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handlePindahKePerbaikan = () => {
        if (selectedIds.length === 0) return;
        router.post(
            route('stock.rusak.perbaiki'),
            { barang_ids: selectedIds },
            {
                onSuccess: () => handleCloseModal(),
                preserveScroll: true,
            },
        );
    };

    const handleAjukanPemusnahan = () => {
        if (selectedIds.length === 0) {
            alert('Pilih setidaknya satu barang.');
            return;
        }
        if (!alasan.trim()) {
            alert('Alasan pemusnahan wajib diisi.');
            return;
        }
        router.post(
            route('stock.rusak.pemusnahan.ajukan'),
            { barang_ids: selectedIds, alasan },
            {
                onSuccess: () => handleCloseModal(),
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stok Rusak (Gudang)</h1>
                    <Link href={route('stock.rusak.pemusnahan.index')} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Lihat Daftar Pemusnahan
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left">No</th>
                                <th className="border px-4 py-2 text-left">Lokasi</th>
                                <th className="border px-4 py-2 text-left">Kategori</th>
                                <th className="border px-4 py-2 text-left">Nama Barang</th>
                                <th className="border px-4 py-2 text-right">Jumlah</th>
                                <th className="border px-4 py-2 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stokRusak.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2">{index + 1}</td>
                                    <td className="border px-4 py-2">{item.lokasi}</td>
                                    <td className="border px-4 py-2">{item.kategori}</td>
                                    <td className="border px-4 py-2">{item.nama_barang}</td>
                                    <td className="border px-4 py-2 text-right">{item.jumlah_rusak}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="rounded bg-blue-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Komponen Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-2 text-xl font-bold">Detail Barang Rusak: {currentItem?.nama_barang}</h2>
                        <p className="mb-4 text-sm text-gray-600">Pilih barang yang akan diproses.</p>

                        {isLoading ? (
                            <p>Memuat data...</p>
                        ) : (
                            <div>
                                <div className="h-64 overflow-y-auto border">
                                    <table className="min-w-full">
                                        <thead className="sticky top-0 bg-gray-50">
                                            <tr>
                                                <th className="w-16 px-4 py-2">
                                                    <input type="checkbox" disabled />
                                                </th>
                                                <th className="w-16 px-4 py-2 text-left">No</th>
                                                <th className="px-4 py-2 text-left">Serial Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailItems.map((detail, idx) => (
                                                <tr key={detail.id} className="hover:bg-gray-100">
                                                    <td className="px-4 py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(detail.id)}
                                                            onChange={() => handleCheckboxChange(detail.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-left">{idx + 1}</td>
                                                    <td className="px-4 py-2">{detail.serial_number}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="alasan" className="block text-sm font-medium text-gray-700">
                                        Alasan Pemusnahan (Wajib diisi jika ingin memusnahkan)
                                    </label>
                                    <textarea
                                        id="alasan"
                                        value={alasan}
                                        onChange={(e) => setAlasan(e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Contoh: Barang rusak parah akibat terjatuh, tidak bisa diperbaiki."
                                    ></textarea>
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={handleAjukanPemusnahan}
                                        disabled={selectedIds.length === 0 || !alasan.trim() || router.processing}
                                        className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {router.processing ? 'Memproses...' : `Ajukan Pemusnahan (${selectedIds.length})`}
                                    </button>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleCloseModal}
                                            type="button"
                                            className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handlePindahKePerbaikan}
                                            disabled={selectedIds.length === 0 || router.processing}
                                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {router.processing ? 'Memproses...' : `Pindah ke Perbaikan (${selectedIds.length})`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
