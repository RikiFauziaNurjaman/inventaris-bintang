// File: resources/js/Pages/transaksi/barang-kembali/BarangKembaliEdit.tsx

import { TransactionFormPage } from '@/components/transaction-page';
import { BulkSerialInput } from '@/components/transaksi/BulkSerialInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// --- Tipe Data ---
interface KembaliInfo {
    serial_number: string;
    kondisi: 'bagus' | 'rusak' | 'diperbaiki';
    keterangan: string;
}

interface Item {
    kategori: string;
    merek: string;
    model: string;
    kembali_info: KembaliInfo[];
}

interface PageProps {
    barangKembali: {
        id: number;
        tanggal: string;
        lokasi: string;
        items: Item[];
    };
    lokasiList: Array<{ id: number; nama: string }>;
    // Anda perlu memastikan controller 'edit' mengirimkan list ini juga
    kategoriList: Array<{ id: number; nama: string }>;
    merekList: Array<{ id: number; nama: string }>;
    modelList: Array<{ id: number; nama: string }>;
}

// --- Komponen untuk Satu Baris Item ---
const ItemRow = ({ item, index, onItemChange, onRemove, lokasiId }) => {
    // State lokal untuk menyimpan opsi dropdown yang dinamis
    const [kategoriOptions, setKategoriOptions] = useState<{ id: number; nama: string }[]>([]);
    const [merekOptions, setMerekOptions] = useState<{ id: number; nama: string }[]>([]);
    const [modelOptions, setModelOptions] = useState<{ id: number; nama: string }[]>([]);
    const [serialOptions, setSerialOptions] = useState<string[]>([]);
    const [allPossibleSerials, setAllPossibleSerials] = useState<string[]>([]);

    // Menggunakan useEffect untuk memuat data dinamis berdasarkan lokasi dan pilihan
    useEffect(() => {
        if (!lokasiId) return;

        // 1. Fetch Kategori untuk lokasi yang dipilih
        fetch(`/api/kategori-by-lokasi/${lokasiId}`)
            .then((res) => res.json())
            .then(setKategoriOptions);

        // 2. Fetch Merek jika kategori sudah ada
        if (item.kategori) {
            fetch(`/api/merek-by-kategori/${lokasiId}/${encodeURIComponent(item.kategori)}`)
                .then((res) => res.json())
                .then(setMerekOptions);
        }

        // 3. Fetch Model jika merek sudah ada
        if (item.merek) {
            fetch(`/api/model-by-merek/${lokasiId}/${encodeURIComponent(item.merek)}`)
                .then((res) => res.json())
                .then(setModelOptions);
        }

        // 4. Fetch Serial Number jika model sudah ada
        if (item.model) {
            fetch(`/api/serial-by-model/${lokasiId}/${encodeURIComponent(item.model)}`)
                .then((res) => res.json())
                .then((serialsFromServer) => {
                    // Gabungkan serial dari server dengan serial yang sudah ada di transaksi ini
                    const currentSerials = item.kembali_info.map((info) => info.serial_number);
                    const combinedSerials = [...new Set([...serialsFromServer, ...currentSerials])];
                    setSerialOptions(combinedSerials);
                });
        }
    }, [lokasiId, item.kategori, item.merek, item.model]); // Re-fetch jika ada perubahan

    const handleFieldChange = (field, value) => {
        const newItem = { ...item, [field]: value };
        if (field === 'kategori') {
            newItem.merek = '';
            newItem.model = '';
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus', keterangan: '' }];
        } else if (field === 'merek') {
            newItem.model = '';
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus', keterangan: '' }];
        } else if (field === 'model') {
            newItem.kembali_info = [{ serial_number: '', kondisi: 'bagus', keterangan: '' }];
        }
        onItemChange(index, newItem);
    };

    const handleKembaliInfoChange = (infoIndex, field, value) => {
        const newKembaliInfo = [...item.kembali_info];
        newKembaliInfo[infoIndex] = { ...newKembaliInfo[infoIndex], [field]: value };
        onItemChange(index, { ...item, kembali_info: newKembaliInfo });
    };

    const addSerialField = () => onItemChange(index, { ...item, kembali_info: [...item.kembali_info, { serial_number: '', kondisi: 'bagus', keterangan: '' }] });
    const removeSerialField = (infoIndex) => onItemChange(index, { ...item, kembali_info: item.kembali_info.filter((_, i) => i !== infoIndex) });

    return (
        <div className="relative mb-6 rounded-xl border bg-muted/30 p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Item Pengembalian #{index + 1}</h3>
            {onRemove && (
                <button type="button" onClick={onRemove} className="absolute top-2 right-2 font-bold text-red-500 hover:text-red-700">
                    &times; Hapus Item
                </button>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label>Kategori</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
                        value={item.kategori}
                        onChange={(e) => handleFieldChange('kategori', e.target.value)}
                        disabled={!lokasiId}
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriOptions.map((k) => (
                            <option key={k.id} value={k.nama}>
                                {k.nama}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Merek</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
                        value={item.merek}
                        onChange={(e) => handleFieldChange('merek', e.target.value)}
                        disabled={!item.kategori}
                    >
                        <option value="">-- Pilih Merek --</option>
                        {merekOptions.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Model</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
                        value={item.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        disabled={!item.merek}
                    >
                        <option value="">-- Pilih Model --</option>
                        {modelOptions.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-red-700">Serial Number & Kondisi</label>
                <BulkSerialInput
                    existingSerials={item.kembali_info.map((info) => info.serial_number)}
                    allowedSerials={serialOptions}
                    onSerialsParsed={(serials) =>
                        onItemChange(index, {
                            ...item,
                            kembali_info: [
                                ...item.kembali_info.filter((info) => info.serial_number.trim()),
                                ...serials.map((serial_number) => ({ serial_number, kondisi: 'bagus' })),
                            ],
                        })
                    }
                />
                {item.kembali_info.map((info, infoIndex) => (
                    <div key={infoIndex} className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded border-2 border-red-400 bg-red-50 p-2"
                                value={info.serial_number}
                                onChange={(e) => handleKembaliInfoChange(infoIndex, 'serial_number', e.target.value)}
                                placeholder={`Serial #${infoIndex + 1}`}
                                list={`serial-suggest-${index}`}
                                disabled={!item.model}
                            />
                            {item.kembali_info.length > 1 && (
                                <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeSerialField(infoIndex)}>
                                    Hapus
                                </button>
                            )}
                        </div>
                        <div>
                            <select
                                value={info.kondisi}
                                onChange={(e) => handleKembaliInfoChange(infoIndex, 'kondisi', e.target.value as 'bagus' | 'rusak' | 'diperbaiki')}
                                className="w-full rounded border-2 border-blue-400 bg-blue-50 p-2"
                            >
                                <option value="bagus">Bagus</option>
                                <option value="rusak">Rusak</option>
                                <option value="diperbaiki">Diperbaiki</option>
                            </select>
                        </div>
                        {/* Keterangan per item */}
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                className="w-full rounded border p-2"
                                value={info.keterangan || ''}
                                onChange={(e) => handleKembaliInfoChange(infoIndex, 'keterangan', e.target.value)}
                                placeholder="Keterangan kerusakan/catatan (opsional)"
                            />
                        </div>
                    </div>
                ))}
                <datalist id={`serial-suggest-${index}`}>
                    {serialOptions
                        .filter((sn) => !item.kembali_info.some((k) => k.serial_number === sn) || sn === item.kembali_info[0]?.serial_number)
                        .map((sn) => (
                            <option key={sn} value={sn} />
                        ))}
                </datalist>
                <button type="button" className="mt-1 text-sm text-blue-600 hover:underline" onClick={addSerialField} disabled={!item.model}>
                    + Tambah Serial
                </button>
            </div>
        </div>
    );
};

// --- Komponen Edit Utama ---
export default function BarangKembaliEdit() {
    const { barangKembali, lokasiList } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        tanggal: barangKembali.tanggal,
        lokasi: barangKembali.lokasi,
        items: barangKembali.items,
    });

    const selectedLokasiId = lokasiList.find((l) => l.nama === data.lokasi)?.id || null;

    // Reset items jika lokasi utama diubah dari nilai aslinya
    useEffect(() => {
        if (data.lokasi !== barangKembali.lokasi) {
            setData('items', [{ kategori: '', merek: '', model: '', kembali_info: [{ serial_number: '', kondisi: 'bagus', keterangan: '' }] }]);
        }
    }, [data.lokasi]);

    const handleItemChange = (index: number, updatedItem: Item) => {
        setData(
            'items',
            data.items.map((item, i) => (i === index ? updatedItem : item)),
        );
    };

    const addItemRow = () => {
        setData('items', [...data.items, { kategori: '', merek: '', model: '', kembali_info: [{ serial_number: '', kondisi: 'bagus', keterangan: '' }] }]);
    };

    const removeItemRow = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('barang-kembali.update', barangKembali.id), {
            onSuccess: () =>
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data barang kembali berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false,
                }),
            onError: (err) => Swal.fire({ icon: 'error', title: 'Gagal', text: Object.values(err)[0] || 'Periksa kembali isian form Anda.' }),
        });
    };

    return (
        <TransactionFormPage
            title="Edit Barang Kembali"
            description="Perbarui lokasi asal dan kondisi unit yang dikembalikan."
            backHref={route('barang-kembali.index')}
        >
            <form onSubmit={handleSubmit} className="transaction-form-card rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
                    <div>
                        <label>Tanggal Pengembalian</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded border p-2"
                            value={data.tanggal}
                            onChange={(e) => setData('tanggal', e.target.value)}
                        />
                        {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                    </div>
                    <div>
                        <label>Lokasi Asal Barang (Tempat Kembali)</label>
                        <select className="mt-1 w-full rounded border p-2" value={data.lokasi} onChange={(e) => setData('lokasi', e.target.value)}>
                            <option value="">-- Pilih Lokasi Asal --</option>
                            {lokasiList.map((l) => (
                                <option key={l.id} value={l.nama}>
                                    {l.nama}
                                </option>
                            ))}
                        </select>
                        {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
                    </div>
                </div>

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

                <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={addItemRow}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                        disabled={!data.lokasi}
                    >
                        + Tambah Item
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={route('barang-kembali.index')}
                            className="rounded-lg border border-input bg-background px-5 py-2.5 text-center text-sm font-medium text-foreground hover:bg-accent"
                        >
                            Kembali
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            Perbarui Transaksi
                        </button>
                    </div>
                </div>
            </form>
        </TransactionFormPage>
    );
}
