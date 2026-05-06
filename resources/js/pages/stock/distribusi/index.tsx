import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { DetailStokModal } from './detail';

interface StokDistribusiItem {
    model_id: number;
    lokasi_id: number;
    lokasi: string;
    kategori: string;
    merek: string;
    model: string;
    jumlah_tersedia: number;
}

interface Props {
    stokDistribusi: StokDistribusiItem[];
}

export default function Index({ stokDistribusi }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StokDistribusiItem | null>(null);
    const [detailData, setDetailData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk menampilkan modal dan mengambil data detail
    const handleShowDetail = async (item: StokDistribusiItem) => {
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
            <div className="p-4">
                {/* Simplified Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Stok Distribusi</h1>
                    <p className="text-gray-600">Data Semua Item Di Lokasi</p>
                </div>

                {/* Simplified Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border-b p-3 text-left text-sm font-medium text-gray-600">No</th>
                                <th className="border-b p-3 text-left text-sm font-medium text-gray-600">Lokasi</th>
                                <th className="border-b p-3 text-left text-sm font-medium text-gray-600">Kategori</th>
                                <th className="border-b p-3 text-left text-sm font-medium text-gray-600">Nama Barang</th>
                                <th className="border-b p-3 text-right text-sm font-medium text-gray-600">Jumlah</th>

                                <th className="border-b p-3 text-center text-sm font-medium text-gray-600">Lokasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stokDistribusi.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border-b p-3 text-sm">{index + 1}</td>
                                    <td className="border-b p-3 text-sm">{item.lokasi}</td>
                                    <td className="border-b p-3 text-sm">{item.kategori}</td>
                                    <td className="border-b p-3 text-sm">{[item.merek, item.model].filter(Boolean).join(' ')}</td>
                                    <td className="border-b p-3 text-right text-sm">{item.jumlah_tersedia}</td>
                                    <td className="border-b p-3 text-center">
                                        <Link
                                            href={route('monitoring.lokasi.detail', item.lokasi_id)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                            title="Lihat semua barang di lokasi ini"
                                        >
                                            <ExternalLink size={14} />
                                            Detail Lokasi
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simplified Modal */}
            <DetailStokModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                details={detailData}
                isLoading={isLoading}
            />
        </AppLayout>
    );
}
