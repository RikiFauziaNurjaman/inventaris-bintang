// File: resources/js/Pages/transaksi/barang-keluar/BarangKeluarEdit.tsx

import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import Swal from 'sweetalert2';

// 1. Definisikan ulang tipe data props
interface KeluarInfo {
    serial_number: string;
    status_keluar: 'dipinjamkan' | 'dijual' | 'maintenance';
}

interface Item {
    kategori: string;
    merek: string;
    model: string;
    keluar_info: KeluarInfo[];
}

interface PageProps {
    barangKeluar: {
        id: number;
        tanggal: string;
        lokasi: string;
        items: Item[]; // Struktur baru
    };
    lokasiList: Array<{ id: number; nama: string }>;
    serialNumberList: Record<string, string[]>;
    kategoriList: Array<{ id: number; nama: string }>;
    merekList: Array<{ id: number; nama: string; model_barang: any[] }>;
    modelList: Array<{ id: number; nama: string; merek_id: number; jenis?: { kategori_id: number } }>;
}

// 2. Gunakan kembali komponen ItemRow yang sama dari form Create
// (Sangat disarankan untuk mengekstrak ini ke file terpisah dan mengimpornya)
const ItemRow = ({ item, index, onItemChange, onRemove, errors, lists }) => {
    const kategoriOptions = lists?.kategoriList || [];
    const merekOptions = lists?.merekList || [];
    const modelOptions = lists?.modelList || [];
    const serialNumberOptions = lists?.serialNumberList || {};
    // Filter merek berdasarkan kategori yang dipilih di baris ini
    const selectedKategoriId = lists.kategoriList.find((k) => k.nama === item.kategori)?.id;
    const filteredMerekList = selectedKategoriId
        ? lists.merekList.filter((merek) => merek.model_barang?.some((model) => model.kategori_id === selectedKategoriId))
        : lists.merekList;

    // Filter model berdasarkan merek dan kategori yang dipilih
    const selectedMerekId = lists.merekList.find((m) => m.nama === item.merek)?.id;
    const filteredModelList = lists.modelList.filter((model) => model.merek_id === selectedMerekId && model.kategori_id === selectedKategoriId);

    // Dapatkan serial number berdasarkan level filter yang dipilih
    let allAvailableSerials: string[] = [];
    if (item.model && item.merek) {
        // Level 3: Model spesifik dipilih
        const key = `${item.merek}|${item.model}`;
        allAvailableSerials = lists.serialNumberList[key] || [];
    } else if (item.merek) {
        // Level 2: Hanya merek dipilih — tampilkan semua serial untuk merek ini
        allAvailableSerials = Object.entries(lists.serialNumberList)
            .filter(([key]) => key.startsWith(`${item.merek}|`))
            .flatMap(([, serials]) => serials as string[]);
    } else if (item.kategori && selectedKategoriId) {
        // Level 1: Hanya kategori dipilih — tampilkan semua serial untuk merek di kategori ini
        const merekNamesInKategori = filteredMerekList.map((m) => m.nama);
        allAvailableSerials = Object.entries(lists.serialNumberList)
            .filter(([key]) => merekNamesInKategori.includes(key.split('|')[0]))
            .flatMap(([, serials]) => serials as string[]);
    }
    const usedSerialsInRow = item.keluar_info.map((info) => info.serial_number);
    const availableSerialsForSuggestions = allAvailableSerials.filter((sn) => !usedSerialsInRow.includes(sn));

    const handleFieldChange = (field, value) => {
        const newItem = { ...item, [field]: value };
        // Reset field turunan jika field utama berubah
        if (field === 'kategori') {
            newItem.merek = '';
            newItem.model = '';
            newItem.keluar_info = [{ serial_number: '', status_keluar: 'dipinjamkan' }];
        } else if (field === 'merek') {
            newItem.model = '';
            newItem.keluar_info = [{ serial_number: '', status_keluar: 'dipinjamkan' }];
        }
        onItemChange(index, newItem);
    };

    const handleKeluarInfoChange = (infoIndex, field, value) => {
        const newKeluarInfo = [...item.keluar_info];
        newKeluarInfo[infoIndex] = { ...newKeluarInfo[infoIndex], [field]: value };
        onItemChange(index, { ...item, keluar_info: newKeluarInfo });
    };

    const addSerialField = () => {
        const newKeluarInfo = [...item.keluar_info, { serial_number: '', status_keluar: 'dipinjamkan' }];
        onItemChange(index, { ...item, keluar_info: newKeluarInfo });
    };

    const removeSerialField = (infoIndex) => {
        const newKeluarInfo = item.keluar_info.filter((_, i) => i !== infoIndex);
        onItemChange(index, { ...item, keluar_info: newKeluarInfo });
    };

    return (
        <div className="relative mb-6 rounded-lg border-2 border-gray-200 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Item #{index + 1}</h3>
            {onRemove && (
                <button type="button" onClick={onRemove} className="absolute top-2 right-2 font-bold text-red-500 hover:text-red-700">
                    &times; Hapus Item
                </button>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Kategori */}
                <div>
                    <label>Kategori</label>
                    <select
                        className="mt-1 w-full rounded border p-2"
                        value={item.kategori}
                        onChange={(e) => handleFieldChange('kategori', e.target.value)}
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriOptions.map((k) => (
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
                        disabled={!item.kategori}
                    >
                        <option value="">-- Pilih Merek --</option>
                        {filteredMerekList.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
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
                        disabled={!item.merek}
                    >
                        <option value="">-- Pilih Model --</option>
                        {filteredModelList.map((m) => (
                            <option key={m.id} value={m.nama}>
                                {m.nama}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Serial Numbers & Status */}
            <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-red-700">Serial Number & Status</label>
                {item.keluar_info.map((info, infoIndex) => (
                    <div key={infoIndex} className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded border-2 border-red-400 bg-red-50 p-2"
                                value={info.serial_number}
                                onChange={(e) => handleKeluarInfoChange(infoIndex, 'serial_number', e.target.value)}
                                placeholder={`Serial #${infoIndex + 1}`}
                                list={`serial-suggest-${index}-${infoIndex}`}
                            />
                            <datalist id={`serial-suggest-${index}-${infoIndex}`}>
                                {availableSerialsForSuggestions.map((sn) => (
                                    <option key={sn} value={sn} />
                                ))}
                            </datalist>
                            {item.keluar_info.length > 1 && (
                                <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeSerialField(infoIndex)}>
                                    Hapus
                                </button>
                            )}
                        </div>
                        <div>
                            <select
                                value={info.status_keluar}
                                onChange={(e) => handleKeluarInfoChange(infoIndex, 'status_keluar', e.target.value)}
                                className="w-full rounded border-2 border-blue-400 bg-blue-50 p-2"
                            >
                                <option value="dipinjamkan">Dipinjamkan</option>
                                <option value="dijual">Dijual</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                ))}
                <button type="button" className="mt-1 text-sm text-blue-600 hover:underline" onClick={addSerialField}>
                    + Tambah Serial
                </button>
            </div>
        </div>
    );
};

// 3. Komponen Edit Utama yang sudah di-refactor
export default function BarangKeluarEdit() {
    const { barangKeluar, lokasiList, kategoriList, merekList, modelList, serialNumberList } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        tanggal: barangKeluar.tanggal,
        lokasi: barangKeluar.lokasi,
        items: barangKeluar.items, // Inisialisasi dengan struktur items yang baru
    });

    const handleItemChange = (index: number, updatedItem: Item) => {
        const newItems = [...data.items];
        newItems[index] = updatedItem;
        setData('items', newItems);
    };

    const addItemRow = () => {
        setData('items', [
            ...data.items,
            {
                kategori: '',
                merek: '',
                model: '',
                keluar_info: [{ serial_number: '', status_keluar: 'dipinjamkan' }],
            },
        ]);
    };

    const removeItemRow = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('barang-keluar.update', barangKeluar.id), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data barang keluar berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            onError: () => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Periksa kembali isian form Anda.' });
            },
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Transaksi Barang Keluar</h1>
                <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
                    {/* Header Form (Tanggal & Lokasi) */}
                    <div className="mb-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
                        <div>
                            <label>Tanggal</label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded border p-2"
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                            />
                            {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                        </div>
                        <div>
                            <label>Tujuan Distribusi</label>
                            <input
                                type="text"
                                list="lokasi-suggest"
                                className="mt-1 w-full rounded border p-2"
                                value={data.lokasi}
                                onChange={(e) => setData('lokasi', e.target.value)}
                            />
                            <datalist id="lokasi-suggest">
                                {lokasiList.map((l) => (
                                    <option key={l.id} value={l.nama} />
                                ))}
                            </datalist>
                            {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
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
                            errors={errors}
                            lists={{ kategoriList, merekList, modelList, serialNumberList }}
                        />
                    ))}

                    {/* Tombol Aksi */}
                    <div className="mt-6 flex items-center justify-between">
                        <button type="button" onClick={addItemRow} className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                            + Tambah Item
                        </button>
                        <div className="flex space-x-4">
                            <Link href={route('barang-keluar.index')} className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600">
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
