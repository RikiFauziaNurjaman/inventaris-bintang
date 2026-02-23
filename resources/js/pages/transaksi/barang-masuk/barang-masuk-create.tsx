import { BulkSerialInput } from '@/components/transaksi/BulkSerialInput';
import { showTransactionPreview } from '@/components/transaksi/TransactionPreview';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Item {
    kategori: string;
    merek: string;
    model: string;
    jenis_barang: string;
    rak_nama: string;
    rak_baris: string;
    rak_id: number | null;
    serial_numbers: string[];
}

const ItemRow = ({ item, index, onItemChange, onRemove, errors, lists, usedModels }) => {
    const [jenisOptions, setJenisOptions] = useState<string[]>([]);
    const [modelOptions, setModelOptions] = useState<string[]>([]);
    const [barisOptions, setBarisOptions] = useState<string[]>([]);
    const [loadingJenis, setLoadingJenis] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);

    // Efek untuk memuat Jenis Barang saat Kategori berubah
    useEffect(() => {
        if (!item.kategori) {
            setJenisOptions([]);
            return;
        }
        setLoadingJenis(true);
        fetch(`/ajax/jenis-barang?kategori=${encodeURIComponent(item.kategori)}`)
            .then((res) => res.json())
            .then((res) => setJenisOptions(res))
            .finally(() => setLoadingJenis(false));
    }, [item.kategori]);

    // Efek untuk memuat Model saat Jenis Barang berubah
    useEffect(() => {
        if (!item.jenis_barang) {
            setModelOptions([]);
            return;
        }
        setLoadingModel(true);
        fetch(`/ajax/model-barang?jenis_barang=${encodeURIComponent(item.jenis_barang)}`)
            .then((res) => res.json())
            .then((res) => setModelOptions(res))
            .finally(() => setLoadingModel(false));
    }, [item.jenis_barang]);

    // FUNGSI BARU: menangani perubahan dropdown "Nama Rak"
    const handleRakNamaChange = (namaRak: string) => {
        // 1. Cari semua baris yang cocok dengan nama rak yang dipilih
        const availableBaris = lists.rakList.filter((r) => r.nama_rak === namaRak).map((r) => r.baris);
        setBarisOptions(availableBaris);

        // 2. Update state di parent, set nama rak dan reset baris & id
        onItemChange(index, {
            ...item,
            rak_nama: namaRak,
            rak_baris: '', // Kosongkan pilihan baris
            rak_id: null, // Reset ID
        });
    };

    // FUNGSI BARU: menangani perubahan dropdown "Baris"
    const handleRakBarisChange = (baris: string) => {
        // 1. Cari objek rak yang lengkap untuk mendapatkan ID-nya
        const selectedRak = lists.rakList.find((r) => r.nama_rak === item.rak_nama && r.baris === baris);

        // 2. Update state di parent dengan baris dan ID yang terpilih
        onItemChange(index, {
            ...item,
            rak_baris: baris,
            rak_id: selectedRak ? selectedRak.id : null,
        });
    };

    const handleFieldChange = (field, value) => {
        const newItem = { ...item, [field]: value };
        if (field === 'kategori') {
            newItem.jenis_barang = '';
            newItem.model = '';
        } else if (field === 'jenis_barang') {
            newItem.model = '';
        }
        onItemChange(index, newItem);
    };

    const handleSerialChange = (serialIndex, value) => {
        const newSerials = [...item.serial_numbers];
        newSerials[serialIndex] = value;
        onItemChange(index, { ...item, serial_numbers: newSerials });
    };

    const addSerialField = () => {
        onItemChange(index, { ...item, serial_numbers: [...item.serial_numbers, ''] });
    };

    const removeSerialField = (serialIndex) => {
        const newSerials = item.serial_numbers.filter((_, i) => i !== serialIndex);
        onItemChange(index, { ...item, serial_numbers: newSerials });
    };

    // Dapatkan error untuk item spesifik ini
    const getError = (field) => errors && errors[`items.${index}.${field}`];
    const kategoriError = getError('kategori');
    const merekError = getError('merek');
    const jenisBarangError = getError('jenis_barang');
    const modelError = getError('model');
    const rakError = getError('rak_id');

    const availableModelOptions = modelOptions.filter((m) => !usedModels.includes(m));

    return (
        <div className="relative mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Barang #{index + 1}</h3>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Kategori */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                    <select
                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${kategoriError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                        value={item.kategori}
                        onChange={(e) => handleFieldChange('kategori', e.target.value)}
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {lists.kategoriList.map((k) => (
                            <option key={k.id} value={k.nama}>
                                {k.nama}
                            </option>
                        ))}
                    </select>
                    {kategoriError && <p className="text-xs text-red-500">{kategoriError}</p>}
                </div>

                {/* Merek */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merek</label>
                    <select
                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${merekError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                        value={item.merek}
                        onChange={(e) => handleFieldChange('merek', e.target.value)}
                    >
                        <option value="">-- Pilih Merek --</option>
                        {lists.merekList.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                    {merekError && <p className="text-xs text-red-500">{merekError}</p>}
                </div>

                {/* Jenis Barang */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jenis Barang
                        {loadingJenis && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                    </label>
                    <select
                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${jenisBarangError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                        value={item.jenis_barang}
                        onChange={(e) => handleFieldChange('jenis_barang', e.target.value)}
                        disabled={!item.kategori}
                    >
                        <option value="">-- Pilih Jenis --</option>
                        {jenisOptions.map((j) => (
                            <option key={j} value={j}>
                                {j}
                            </option>
                        ))}
                    </select>
                    {jenisBarangError && <p className="text-xs text-red-500">{jenisBarangError}</p>}
                </div>

                {/* Model */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Model
                        {loadingModel && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                    </label>
                    <select
                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${modelError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                        value={item.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        disabled={!item.jenis_barang}
                    >
                        <option value="">-- Pilih Model --</option>
                        {availableModelOptions.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                    {modelError && <p className="text-xs text-red-500">{modelError}</p>}
                </div>

                {/* Rak */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Rak</label>
                    <select
                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${rakError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                        value={item.rak_nama}
                        onChange={(e) => handleRakNamaChange(e.target.value)}
                    >
                        <option value="">-- Pilih Rak --</option>
                        {[...new Set(lists.rakList.map((r) => r.nama_rak))].map((nama) => (
                            <option key={nama} value={nama}>
                                {nama}
                            </option>
                        ))}
                    </select>
                    {rakError && <p className="text-xs text-red-500">{rakError}</p>}
                </div>

                {/* Baris */}
                {barisOptions.length > 0 && (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Baris</label>
                        <select
                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${rakError && !item.rak_baris ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                            value={item.rak_baris}
                            onChange={(e) => handleRakBarisChange(e.target.value)}
                        >
                            <option value="">-- Pilih Baris --</option>
                            {barisOptions.map((baris) => (
                                <option key={baris} value={baris}>
                                    {baris}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Serial Numbers */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800 dark:text-white">
                        Serial Number
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {item.serial_numbers.filter((s) => s.trim()).length} unit
                        </span>
                    </label>
                    <BulkSerialInput
                        existingSerials={item.serial_numbers}
                        onSerialsParsed={(serials) => {
                            const newSerials = [...item.serial_numbers.filter((s) => s.trim()), ...serials];
                            onItemChange(index, { ...item, serial_numbers: newSerials.length > 0 ? newSerials : [''] });
                        }}
                    />
                </div>
                {item.serial_numbers.map((serial, serialIndex) => {
                    const serialError = errors && errors[`items.${index}.serial_numbers.${serialIndex}`];
                    return (
                        <div key={serialIndex} className="mb-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className={`flex-1 rounded-lg border px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white ${serialError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-zinc-600'}`}
                                    value={serial}
                                    onChange={(e) => handleSerialChange(serialIndex, e.target.value)}
                                    placeholder={`Serial #${serialIndex + 1}`}
                                />
                                {item.serial_numbers.length > 1 && (
                                    <button
                                        type="button"
                                        className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                        onClick={() => removeSerialField(serialIndex)}
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                            {serialError && <p className="mt-1 text-xs text-red-500">{serialError}</p>}
                        </div>
                    );
                })}
                <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                    onClick={addSerialField}
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Serial
                </button>
                {getError('serial_numbers') && <p className="mt-2 text-xs text-red-500">{getError('serial_numbers')}</p>}
            </div>
        </div>
    );
};

export default function BarangMasukCreate() {
    const { kategoriList, asalList, merekList, rakList } = usePage().props as any;

    const initialItem: Item = {
        kategori: '',
        merek: '',
        jenis_barang: '',
        model: '',
        rak_nama: '', // field baru
        rak_baris: '', // field baru
        rak_id: null, // field baru
        serial_numbers: [''],
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: new Date().toISOString().slice(0, 10), // Default tanggal hari ini
        asal_barang: '',
        items: [initialItem],
    });

    const handleItemChange = (index: number, updatedItem: Item) => {
        const newItems = [...data.items];
        newItems[index] = updatedItem;
        setData('items', newItems);
    };

    const addItemRow = () => {
        setData('items', [...data.items, initialItem]);
    };

    const removeItemRow = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Tampilkan preview sebelum submit
        const confirmed = await showTransactionPreview(data, 'masuk');
        if (!confirmed) return;

        post(route('barang-masuk.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data barang masuk berhasil disimpan!',
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset();
            },
            onError: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Periksa kembali isian form Anda. Pastikan semua field wajib terisi dan serial number tidak duplikat.',
                });
            },
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Transaksi Barang Masuk</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tambahkan barang baru ke gudang</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        {/* Header Form */}
                        <div className="mb-6 grid grid-cols-1 gap-6 border-b border-gray-100 pb-6 md:grid-cols-2 dark:border-zinc-800">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                />
                                {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asal Barang</label>
                                <input
                                    type="text"
                                    list="asal-suggest"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.asal_barang}
                                    onChange={(e) => setData('asal_barang', e.target.value)}
                                    placeholder="Pilih atau ketik asal barang..."
                                />
                                <datalist id="asal-suggest">
                                    {asalList.map((a) => (
                                        <option key={a.id} value={a.nama} />
                                    ))}
                                </datalist>
                                {errors.asal_barang && <p className="text-xs text-red-500">{errors.asal_barang}</p>}
                            </div>
                        </div>

                        {data.items.map((item, index) => {
                            const usedModels = data.items
                                .filter((_, i) => i !== index)
                                .map((i) => i.model)
                                .filter(Boolean);

                            return (
                                <ItemRow
                                    key={index}
                                    item={item}
                                    index={index}
                                    onItemChange={handleItemChange}
                                    onRemove={data.items.length > 1 ? () => removeItemRow(index) : undefined}
                                    errors={errors}
                                    lists={{ kategoriList, merekList, rakList }}
                                    usedModels={usedModels}
                                />
                            );
                        })}

                        {/* Tombol Aksi */}
                        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah Jenis Barang
                            </button>

                            <div className="flex gap-3">
                                <Link
                                    href={route('barang-masuk.index')}
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
