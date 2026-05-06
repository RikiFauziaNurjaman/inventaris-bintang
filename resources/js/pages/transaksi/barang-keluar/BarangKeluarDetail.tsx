import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function BarangKeluarDetailModal({ show, barangKeluar, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!show || !barangKeluar) {
        return null;
    }

    const formattedDate = new Date(barangKeluar?.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // Flatten items into a flat list for table display
    const flatDetails = (barangKeluar?.items || []).flatMap((item) =>
        (item.details || []).map((detail) => ({
            ...detail,
            kategori: item.kategori,
            merek: item.merek,
            model: item.model,
        })),
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-opacity duration-300 ease-out"
            style={{ opacity: show ? 1 : 0 }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

            {/* Modal Content */}
            <div
                className="relative z-10 w-full max-w-4xl transform rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-out"
                style={{ transform: show ? 'scale(1)' : 'scale(0.95)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Detail Transaksi Barang Keluar</h3>
                        <p className="mt-1 text-sm text-gray-500">Menampilkan informasi lengkap dari sebuah transaksi.</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-6 space-y-6">
                    {/* Info Umum */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                            <p className="font-semibold text-gray-800">{formattedDate}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Lokasi Tujuan</p>
                            <p className="font-semibold text-gray-800">{barangKeluar.lokasi?.nama || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Diinput oleh</p>
                            <p className="font-semibold text-gray-800">{barangKeluar.user?.name || '-'}</p>
                        </div>
                    </div>

                    {/* Daftar Barang */}
                    <div>
                        <p className="text-md mb-2 font-semibold text-gray-700">Rincian Barang:</p>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <div className="max-h-64 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 z-10 bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">No</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Model</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Merek</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Serial Number
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Status Keluar
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {flatDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                                                    Tidak ada data barang.
                                                </td>
                                            </tr>
                                        ) : (
                                            flatDetails.map((detail, index) => (
                                                <tr key={detail.id || index}>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{detail.model}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{detail.merek}</td>
                                                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{detail.serial_number}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800">
                                                            {detail.status_keluar}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() =>
                                                                window.open(
                                                                    route('barang-keluar.cetak-label.item', {
                                                                        barangKeluar: barangKeluar.id,
                                                                        detailId: detail.id,
                                                                    }),
                                                                    '_blank',
                                                                )
                                                            }
                                                            className="rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                                                        >
                                                            Cetak
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
