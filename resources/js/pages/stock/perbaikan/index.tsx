import { PERMISSIONS } from '@/constants/permission';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

interface Item {
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    nama_barang: string;
    jumlah_perbaikan: number;
}

interface DetailItem {
    id: number;
    serial_number: string;
    kondisi_awal: string;
}

interface Props {
    stokPerbaikan: Item[];
    auth: {
        permissions?: string[];
    };
}

export default function Index({ auth, stokPerbaikan }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const userPermissions = auth.permissions || [];
    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [detailItems, setDetailItems] = useState<DetailItem[]>([]);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleOpenModal = async (item: Item) => {
        setCurrentItem(item);
        setIsLoading(true);
        setIsModalOpen(true);

        try {
            const response = await axios.get(
                route('stock.perbaikan.show', {
                    model_id: item.model_id,
                    lokasi_id: item.lokasi_id,
                }),
            );
            setDetailItems(response.data);
        } catch (error) {
            console.error('Gagal mengambil detail barang:', error);

            handleCloseModal();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setDetailItems([]);
        setSelectedIds([]);
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(id)) {
                return prevSelectedIds.filter((selectedId) => selectedId !== id);
            } else {
                return [...prevSelectedIds, id];
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) {
            alert('Pilih setidaknya satu barang untuk diselesaikan.');
            return;
        }

        router.post(
            route('stock.perbaikan.selesai'),
            {
                barang_ids: selectedIds,
            },
            {
                onSuccess: () => {
                    handleCloseModal();
                },
                onError: (errors) => {
                    console.error(errors);
                    alert('Terjadi kesalahan. Silakan coba lagi.');
                },
            },
        );
    };

    const canEditPerbaikan = userPermissions.includes(PERMISSIONS.EDIT_STOK_DIPERBAIKI);

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Stok Sedang Diperbaiki (Gudang)</h1>
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
                            {stokPerbaikan.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="border px-4 py-2">{item.lokasi}</td>
                                    <td className="border px-4 py-2">{item.kategori}</td>
                                    <td className="border px-4 py-2">{item.nama_barang}</td>
                                    <td className="border px-4 py-2 text-right">{item.jumlah_perbaikan}</td>
                                    <td className="border px-4 py-2 text-center">
                                        {/* Tombol Detail */}
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
                        <h2 className="mb-2 text-xl font-bold">Detail Perbaikan: {currentItem?.nama_barang}</h2>
                        <p className="mb-4 text-sm text-gray-600">Lokasi: {currentItem?.lokasi}</p>

                        {isLoading ? (
                            <p>Memuat data...</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="h-64 overflow-y-auto border">
                                    <table className="min-w-full">
                                        <thead className="sticky top-0 bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2">
                                                    <input type="checkbox" disabled />
                                                </th>
                                                <th className="px-4 py-2 text-left">No</th>
                                                <th className="px-4 py-2 text-left">Serial Number</th>
                                                <th className="px-4 py-2 text-left">Kondisi Awal</th>
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
                                                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                                                    <td className="px-4 py-2">{detail.serial_number}</td>
                                                    <td className="px-4 py-2">{detail.kondisi_awal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                    {canEditPerbaikan && (
                                        <button
                                            type="submit"
                                            disabled={selectedIds.length === 0 || router.processing}
                                            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {router.processing ? 'Memproses...' : `Selesaikan Perbaikan (${selectedIds.length})`}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
