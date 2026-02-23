import { BulkSerialInput } from '@/components/transaksi/BulkSerialInput';
import { showTransactionPreview } from '@/components/transaksi/TransactionPreview';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface KembaliInfo {
    serial_number: string;
    kondisi: 'bagus' | 'rusak' | 'diperbaiki';
}

interface Item {
    kategori: string;
    merek: string;
    model: string;
    kembali_info: KembaliInfo[];
}

const ItemRow = ({ item, index, onItemChange, onRemove, lokasiId }) => {
    const [kategoriOptions, setKategoriOptions] = useState<{ id: number; nama: string }[]>([]);
    const [merekOptions, setMerekOptions] = useState<{ id: number; nama: string }[]>([]);
    const [modelOptions, setModelOptions] = useState<{ id: number; nama: string }[]>([]);
    const [serialOptions, setSerialOptions] = useState<string[]>([]);
    const [loadingKategori, setLoadingKategori] = useState(false);
    const [loadingMerek, setLoadingMerek] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);

    useEffect(() => {
        if (lokasiId) {
            setLoadingKategori(true);
            fetch(`/api/kategori-by-lokasi/${lokasiId}`)
                .then((res) => res.json())
                .then(setKategoriOptions)
                .finally(() => setLoadingKategori(false));
        } else {
            setKategoriOptions([]);
        }
    }, [lokasiId]);

    useEffect(() => {
        if (lokasiId && item.kategori) {
            setLoadingMerek(true);
            fetch(`/api/merek-by-kategori/${lokasiId}/${encodeURIComponent(item.kategori)}`)
                .then((res) => res.json())
                .then(setMerekOptions)
                .finally(() => setLoadingMerek(false));
        } else {
            setMerekOptions([]);
        }
    }, [lokasiId, item.kategori]);

    useEffect(() => {
        if (lokasiId && item.merek) {
            setLoadingModel(true);
            fetch(`/api/model-by-merek/${lokasiId}/${encodeURIComponent(item.merek)}`)
                .then((res) => res.json())
                .then(setModelOptions)
                .finally(() => setLoadingModel(false));
        } else {
            setModelOptions([]);
        }
    }, [lokasiId, item.merek]);

    useEffect(() => {
        if (lokasiId && item.model) {
            fetch(`/api/serial-by-model/${lokasiId}/${encodeURIComponent(item.model)}`)
                .then((res) => res.json())
                .then(setSerialOptions);
        } else {
            setSerialOptions([]);
        }
    }, [lokasiId, item.model]);

    const handleFieldChange = (field, value) => {
        const newItem = { ...item, [field]: value };
        if (field === 'kategori') {
            newItem.merek = '';
            newItem.model = '';
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus' }];
        } else if (field === 'merek') {
            newItem.model = '';
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus' }];
        } else if (field === 'model') {
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus' }];
        }
        onItemChange(index, newItem);
    };

    const handleKembaliInfoChange = (infoIndex, field, value) => {
        const newKembaliInfo = [...item.kembali_info];
        newKembaliInfo[infoIndex] = { ...newKembaliInfo[infoIndex], [field]: value };
        onItemChange(index, { ...item, kembali_info: newKembaliInfo });
    };

    const addSerialField = () => onItemChange(index, { ...item, kembali_info: [...item.kembali_info, { serial_number: '', kondisi: 'bagus' }] });
    const removeSerialField = (infoIndex) => onItemChange(index, { ...item, kembali_info: item.kembali_info.filter((_, i) => i !== infoIndex) });

    const handleBulkSerials = (serials: string[]) => {
        const newKembaliInfo = [
            ...item.kembali_info.filter((info) => info.serial_number.trim()),
            ...serials.map((sn) => ({ serial_number: sn, kondisi: 'bagus' as const })),
        ];
        onItemChange(index, { ...item, kembali_info: newKembaliInfo.length > 0 ? newKembaliInfo : [{ serial_number: '', kondisi: 'bagus' }] });
    };

    return (
        <div className="relative mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Item Pengembalian #{index + 1}</h3>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        × Hapus
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Kategori */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kategori
                        {loadingKategori && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                    </label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                        value={item.kategori}
                        onChange={(e) => handleFieldChange('kategori', e.target.value)}
                        disabled={!lokasiId}
                    >
                        <option value="">{lokasiId ? '-- Pilih Kategori --' : 'Pilih lokasi dulu'}</option>
                        {kategoriOptions.map((k) => (
                            <option key={k.id} value={k.nama}>
                                {k.nama}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Merek */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Merek
                        {loadingMerek && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                    </label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                        value={item.merek}
                        onChange={(e) => handleFieldChange('merek', e.target.value)}
                        disabled={!item.kategori}
                    >
                        <option value="">{item.kategori ? '-- Pilih Merek --' : 'Pilih kategori dulu'}</option>
                        {merekOptions.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Model */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Model
                        {loadingModel && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                    </label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                        value={item.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        disabled={!item.merek}
                    >
                        <option value="">{item.merek ? '-- Pilih Model --' : 'Pilih merek dulu'}</option>
                        {modelOptions.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Serial Numbers & Kondisi */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800 dark:text-white">
                        Serial Number & Kondisi
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {item.kembali_info.filter((i) => i.serial_number.trim()).length} unit
                        </span>
                    </label>
                    <BulkSerialInput existingSerials={item.kembali_info.map((i) => i.serial_number)} onSerialsParsed={handleBulkSerials} />
                </div>
                {item.kembali_info.map((info, infoIndex) => (
                    <div key={infoIndex} className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                                value={info.serial_number}
                                onChange={(e) => handleKembaliInfoChange(infoIndex, 'serial_number', e.target.value)}
                                placeholder={`Serial #${infoIndex + 1}`}
                                list={`serial-suggest-${index}`}
                                disabled={!item.model}
                            />
                            {item.kembali_info.length > 1 && (
                                <button
                                    type="button"
                                    className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                                    onClick={() => removeSerialField(infoIndex)}
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                        <div>
                            <select
                                value={info.kondisi}
                                onChange={(e) => handleKembaliInfoChange(infoIndex, 'kondisi', e.target.value as 'bagus' | 'rusak' | 'diperbaiki')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="bagus">Bagus</option>
                                <option value="rusak">Rusak</option>
                                <option value="diperbaiki">Diperbaiki</option>
                            </select>
                        </div>
                    </div>
                ))}
                <datalist id={`serial-suggest-${index}`}>
                    {serialOptions
                        .filter((sn) => !item.kembali_info.some((k) => k.serial_number === sn))
                        .map((sn) => (
                            <option key={sn} value={sn} />
                        ))}
                </datalist>
                <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                    onClick={addSerialField}
                    disabled={!item.model}
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Serial
                </button>
            </div>
        </div>
    );
};

export default function BarangKembaliCreate() {
    const { lokasiList } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: new Date().toISOString().slice(0, 10),
        lokasi: '',
        items: [
            {
                kategori: '',
                merek: '',
                model: '',
                kembali_info: [{ serial_number: '', kondisi: 'bagus' }],
            },
        ] as Item[],
    });

    const selectedLokasiId = lokasiList.find((l) => l.nama === data.lokasi)?.id || null;

    useEffect(() => {
        setData('items', [{ kategori: '', merek: '', model: '', kembali_info: [{ serial_number: '', kondisi: 'bagus' }] }]);
    }, [data.lokasi]);

    const handleItemChange = (index, updatedItem) => {
        setData(
            'items',
            data.items.map((item, i) => (i === index ? updatedItem : item)),
        );
    };

    const addItemRow = () => {
        setData('items', [...data.items, { kategori: '', merek: '', model: '', kembali_info: [{ serial_number: '', kondisi: 'bagus' }] }]);
    };

    const removeItemRow = (index) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmed = await showTransactionPreview(data, 'kembali');
        if (!confirmed) return;

        post(route('barang-kembali.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data barang kembali berhasil disimpan!',
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset();
            },
            onError: (err) => Swal.fire({ icon: 'error', title: 'Gagal', text: Object.values(err)[0] || 'Periksa kembali isian form Anda.' }),
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Transaksi Barang Kembali</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kembalikan barang yang dipinjam ke gudang</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        {/* Header Form */}
                        <div className="mb-6 grid grid-cols-1 gap-6 border-b border-gray-100 pb-6 md:grid-cols-2 dark:border-zinc-800">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Pengembalian</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                />
                                {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lokasi Asal Barang</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                >
                                    <option value="">-- Pilih Lokasi Asal --</option>
                                    {lokasiList.map((l) => (
                                        <option key={l.id} value={l.nama}>
                                            {l.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasi && <p className="text-xs text-red-500">{errors.lokasi}</p>}
                            </div>
                        </div>

                        {/* Daftar Item */}
                        {data.items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                index={index}
                                onItemChange={handleItemChange}
                                onRemove={data.items.length > 1 ? () => removeItemRow(index) : undefined}
                                lokasiId={selectedLokasiId}
                            />
                        ))}

                        {/* Tombol Aksi */}
                        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                disabled={!data.lokasi}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah Item
                            </button>

                            <div className="flex gap-3">
                                <Link
                                    href={route('barang-kembali.index')}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Kembali
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Simpan Transaksi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
