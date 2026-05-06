import AppLayout from '@/layouts/app-layout';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

interface stokTerjualItem {
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    merek: string;
    model: string;
    jumlah_terjual: number;
}

interface Props {
    stokTerjual: stokTerjualItem[];
}

export default function Index({ stokTerjual }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<stokTerjualItem | null>(null);
    const [detailData, setDetailData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk menampilkan modal dan mengambil data detail
    const handleShowDetail = async (item: stokTerjualItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
        setIsLoading(true);
        setDetailData([]);

        try {
            const response = await fetch(route('api.stok-distribusi.detail', { modelBarang: item.model_id, lokasi: item.lokasi_id }));
            if (!response.ok) throw new Error('Gagal mengambil data detail');
            const data = await response.json();
            setDetailData(data);
        } catch (error) {
            console.error('Fetch detail error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <AppLayout>
            <div className="p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Stok Terjual</h1>
                        <p className="mt-1 text-gray-600">Data Semua Item Terjual</p>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2">No</th>
                                    <th className="border px-4 py-2">Lokasi</th>
                                    <th className="border px-4 py-2">Kategori</th>
                                    <th className="border px-4 py-2">Nama Barang</th>
                                    <th className="border px-4 py-2">Jumlah Terjual</th>
                                    <th className="border px-4 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stokTerjual.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{index + 1}</td>
                                        <td className="border px-4 py-2">{item.lokasi}</td>
                                        <td className="border px-4 py-2">{item.kategori}</td>
                                        <td className="border px-4 py-2">{(item.merek ? item.merek + ' ' : '') + item.model}</td>
                                        <td className="border px-4 py-2 text-right">{item.jumlah_terjual}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleShowDetail(item)}
                                                    className="p-1 text-blue-600 hover:text-blue-900"
                                                    title="Lihat Detail"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* <DetailStokModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                details={detailData}
                isLoading={isLoading}
            /> */}
        </AppLayout>
    );
}
