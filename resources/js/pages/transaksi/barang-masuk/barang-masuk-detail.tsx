export default function DetailBarangMasukModal({ show, onClose, barang }) {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="relative w-full max-w-4xl transform rounded-lg bg-white p-6 shadow-xl transition-all">
                {/* Header Modal */}
                <div className="flex items-start justify-between border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Detail Barang Masuk</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body Modal */}
                <div className="mt-4 space-y-4">
                    {/* Info Utama */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <p className="font-semibold text-gray-700">Tanggal Masuk</p>
                            <p className="text-gray-600">{barang?.tanggal || '-'}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">Asal Barang</p>
                            <p className="text-gray-600">{barang?.asal?.nama || 'Manual'}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700">Diinput Oleh</p>
                            <p className="text-gray-600">{barang?.user?.name || '-'}</p>
                        </div>
                    </div>

                    {/* Daftar Item & Serial Number (Tampilan Baru) */}
                    <div>
                        <p className="mt-2 text-sm font-semibold text-gray-700">Daftar Item & Serial Number</p>
                        <div className="mt-2 max-h-64 overflow-y-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Model Barang
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Serial Number
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Keterangan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {barang?.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 align-top text-sm font-medium text-gray-900">
                                                {item.merek} {item.model}
                                                <span className="block text-xs font-normal text-gray-500">{item.kategori}</span>
                                            </td>
                                            <td className="px-4 py-3 align-top text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    {item.serial_numbers.map((sn, snIdx) => (
                                                        <span key={sn} className="block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                                                            {sn}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    {(item.keterangan_list || []).map((ket, ketIdx) => (
                                                        <span key={ketIdx} className="block py-0.5 text-xs text-gray-600">
                                                            {ket || '-'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!barang?.items || barang.items.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500">
                                                Tidak ada detail item.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="mt-6 flex justify-end border-t pt-4">
                    <button onClick={onClose} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
