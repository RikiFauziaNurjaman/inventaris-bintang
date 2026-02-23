import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Item {
    kategori: string;
    merek: string;
    jenis_barang: string;
    model: string;
    rak_nama: string;
    rak_baris: string;
    rak_id: number | null;
    serial_numbers: string[];
}

const ItemRow = ({ item, index, onItemChange, onRemove, errors, lists }) => {
    const [jenisOptions, setJenisOptions] = useState<string[]>([]);
    const [modelOptions, setModelOptions] = useState<string[]>([]);
    const [barisOptions, setBarisOptions] = useState<string[]>([]);

    useEffect(() => {
        if (!item.kategori) {
            setJenisOptions([]);
            return;
        }
        fetch(`/ajax/jenis-barang?kategori=${encodeURIComponent(item.kategori)}`)
            .then((res) => res.json())
            .then(setJenisOptions);
    }, [item.kategori]);

    useEffect(() => {
        if (!item.jenis_barang) {
            setModelOptions([]);
            return;
        }
        fetch(`/ajax/model-barang?jenis_barang=${encodeURIComponent(item.jenis_barang)}`)
            .then((res) => res.json())
            .then(setModelOptions);
    }, [item.jenis_barang]);

    // Efek untuk mengisi 'barisOptions' saat komponen pertama kali dimuat
    useEffect(() => {
        if (item.rak_nama) {
            const availableBaris = lists.rakList.filter((r) => r.nama_rak === item.rak_nama).map((r) => r.baris);
            setBarisOptions(availableBaris);
        }
    }, []); // Hanya dijalankan sekali saat mount

    const handleRakNamaChange = (namaRak: string) => {
        const availableBaris = lists.rakList.filter((r) => r.nama_rak === namaRak).map((r) => r.baris);
        setBarisOptions(availableBaris);
        onItemChange(index, { ...item, rak_nama: namaRak, rak_baris: '', rak_id: null });
    };

    const handleRakBarisChange = (baris: string) => {
        const selectedRak = lists.rakList.find((r) => r.nama_rak === item.rak_nama && r.baris === baris);
        onItemChange(index, { ...item, rak_baris: baris, rak_id: selectedRak ? selectedRak.id : null });
    };

    const handleFieldChange = (field: keyof Item, value: any) => {
        const newItem = { ...item, [field]: value };
        if (field === 'kategori') {
            newItem.jenis_barang = '';
            newItem.model = '';
        } else if (field === 'jenis_barang') {
            newItem.model = '';
        }
        onItemChange(index, newItem);
    };

    const handleSerialChange = (serialIndex: number, value: string) => {
        const newSerials = [...item.serial_numbers];
        newSerials[serialIndex] = value;
        handleFieldChange('serial_numbers', newSerials);
    };

    const addSerialField = () => handleFieldChange('serial_numbers', [...item.serial_numbers, '']);

    const removeSerialField = (serialIndex: number) => {
        const newSerials = item.serial_numbers.filter((_, i) => i !== serialIndex);
        handleFieldChange('serial_numbers', newSerials);
    };

    return (
        <div className="relative mb-6 rounded-lg border-2 border-gray-200 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Barang #{index + 1}</h3>
            {onRemove && (
                <button type="button" onClick={onRemove} className="absolute top-2 right-2 font-bold text-red-500 hover:text-red-700">
                    &times; Hapus Barang
                </button>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Kategori */}
                <div>
                    <label>Kategori</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
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
                </div>

                {/* Merek */}
                <div>
                    <label>Merek</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
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
                </div>

                {/* Jenis Barang */}
                <div>
                    <label>Jenis Barang</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
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
                </div>

                {/* Model */}
                <div>
                    <label>Model</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
                        value={item.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        disabled={!item.jenis_barang}
                    >
                        <option value="">-- Pilih Model --</option>
                        {modelOptions.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rak & Baris */}
                <div>
                    <label>Nama Rak</label>
                    <select className="mt-1 w-full rounded border p-2" value={item.rak_nama} onChange={(e) => handleRakNamaChange(e.target.value)}>
                        <option value="">-- Pilih Rak --</option>
                        {[...new Set(lists.rakList.map((r) => r.nama_rak))].map((nama) => (
                            <option key={nama} value={nama}>
                                {nama}
                            </option>
                        ))}
                    </select>
                </div>
                {barisOptions.length > 0 && (
                    <div>
                        <label>Baris</label>
                        <select
                            className="mt-1 w-full rounded border p-2"
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
            <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-red-700">Serial Number</label>
                {item.serial_numbers.map((serial, serialIndex) => (
                    <div key={serialIndex} className="mb-2 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded border-2 border-red-400 bg-red-50 p-2"
                            value={serial}
                            onChange={(e) => handleSerialChange(serialIndex, e.target.value)}
                            placeholder={`Serial #${serialIndex + 1}`}
                        />
                        {item.serial_numbers.length > 1 && (
                            <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeSerialField(serialIndex)}>
                                Hapus
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="mt-1 text-sm text-blue-600 hover:underline" onClick={addSerialField}>
                    + Tambah Serial
                </button>
            </div>
        </div>
    );
};

// --- Komponen Edit Utama ---
export default function BarangMasukEdit() {
    const { barangMasuk, kategoriList, asalList, merekList, rakList } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        tanggal: barangMasuk.tanggal || '',
        asal_barang: barangMasuk.asal_barang || '',
        items: barangMasuk.items || [], // Inisialisasi dengan items yang ada
    });

    const handleItemChange = (index: number, updatedItem: Item) => {
        const newItems = [...data.items];
        newItems[index] = updatedItem;
        setData('items', newItems);
    };

    const addItemRow = () => {
        const newItem: Item = {
            kategori: '',
            merek: '',
            jenis_barang: '',
            model: '',
            rak_nama: '',
            rak_baris: '',
            rak_id: null,
            serial_numbers: [''],
        };
        setData('items', [...data.items, newItem]);
    };

    const removeItemRow = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('barang-masuk.update', barangMasuk.id), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diperbarui!', timer: 2000, showConfirmButton: false });
            },
            onError: () => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Periksa kembali isian form Anda.' });
            },
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Transaksi Barang Masuk</h1>
                <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded border p-2"
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                            />
                            {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asal Barang</label>
                            <input
                                type="text"
                                list="asal-suggest"
                                className="mt-1 w-full rounded border p-2"
                                value={data.asal_barang || ''}
                                onChange={(e) => setData('asal_barang', e.target.value)}
                            />
                            <datalist id="asal-suggest">
                                {asalList.map((a) => (
                                    <option key={a.id} value={a.nama} />
                                ))}
                            </datalist>
                            {errors.asal_barang && <p className="text-sm text-red-500">{errors.asal_barang}</p>}
                        </div>
                    </div>

                    {data.items.map((item, index) => (
                        <ItemRow
                            key={index}
                            item={item}
                            index={index}
                            onItemChange={handleItemChange}
                            onRemove={data.items.length > 1 ? () => removeItemRow(index) : undefined}
                            errors={errors}
                            lists={{ kategoriList, merekList, rakList }}
                        />
                    ))}

                    <div className="mt-6 flex items-center justify-between">
                        <button type="button" onClick={addItemRow} className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                            + Tambah Jenis Barang
                        </button>
                        <div className="flex space-x-4">
                            <Link href={route('barang-masuk.index')} className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600">
                                Kembali
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Perbarui Transaksi
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
