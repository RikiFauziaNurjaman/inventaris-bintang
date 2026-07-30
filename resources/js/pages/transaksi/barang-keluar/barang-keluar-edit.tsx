// File: resources/js/Pages/transaksi/barang-keluar/BarangKeluarEdit.tsx

import { TransactionFormPage } from '@/components/transaction-page';
import { BulkSerialInput } from '@/components/transaksi/BulkSerialInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// 1. Definisikan ulang tipe data props
interface KeluarInfo {
    serial_number: string;
    status_keluar: 'dipinjamkan' | 'dijual' | 'maintenance';
    sub_lokasi: string;
}

interface Item {
    kategori: string;
    merek: string;
    model: string;
    keluar_info: KeluarInfo[];
}

interface PageProps {
    barangKeluar: {
        tanggal: string;
        lokasi: string;
        pic: string;
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
const ItemRow = ({ item, index, onItemChange, onRemove, errors, lists, subLokasiOptions, loadingSubLokasi }) => {
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
        const newKeluarInfo = [...item.keluar_info, { serial_number: '', status_keluar: 'dipinjamkan', sub_lokasi: '' }];
        onItemChange(index, { ...item, keluar_info: newKeluarInfo });
    };

    const removeSerialField = (infoIndex) => {
        const newKeluarInfo = item.keluar_info.filter((_, i) => i !== infoIndex);
        onItemChange(index, { ...item, keluar_info: newKeluarInfo });
    };

    return (
        <div className="relative mb-6 rounded-xl border bg-muted/30 p-5">
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
                <BulkSerialInput
                    existingSerials={usedSerialsInRow}
                    allowedSerials={allAvailableSerials}
                    onSerialsParsed={(serials) =>
                        onItemChange(index, {
                            ...item,
                            keluar_info: [
                                ...item.keluar_info.filter((info) => info.serial_number.trim()),
                                ...serials.map((serial_number) => ({
                                    serial_number,
                                    status_keluar: 'dipinjamkan',
                                    sub_lokasi: '',
                                })),
                            ],
                        })
                    }
                />
                {item.keluar_info.map((info, infoIndex) => (
                    <div key={infoIndex} className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Serial Number</label>
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
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
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
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sub Lokasi</label>
                            <div className="flex items-center gap-2">
                                <select
                                    className="flex-1 rounded border p-2 disabled:bg-gray-100"
                                    value={info.sub_lokasi}
                                    onChange={(e) => handleKeluarInfoChange(infoIndex, 'sub_lokasi', e.target.value)}
                                    disabled={subLokasiOptions.length === 0}
                                >
                                    <option value="">-- Sub Lokasi --</option>
                                    {subLokasiOptions.map((s) => (
                                        <option key={s.id} value={s.nama}>
                                            {s.nama} {s.lantai ? `(Lt. ${s.lantai})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {item.keluar_info.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-sm text-red-600 hover:underline"
                                        onClick={() => removeSerialField(infoIndex)}
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
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

    const [subLokasiOptions, setSubLokasiOptions] = useState<{ id: number; nama: string; lantai: string | null }[]>([]);
    const [loadingSubLokasi, setLoadingSubLokasi] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        tanggal: barangKeluar.tanggal,
        lokasi: barangKeluar.lokasi,
        pic: barangKeluar.pic || '',
        items: barangKeluar.items, // Inisialisasi dengan struktur items yang baru
    });

    // Fetch sub-lokasi ketika lokasi berubah
    useEffect(() => {
        if (data.lokasi) {
            const lokasiId = lokasiList.find((l) => l.nama === data.lokasi)?.id;
            if (lokasiId) {
                setLoadingSubLokasi(true);
                fetch(`/api/sub-lokasi-by-lokasi?lokasi_id=${lokasiId}`)
                    .then((res) => res.json())
                    .then((result) => {
                        setSubLokasiOptions(result);
                    })
                    .finally(() => setLoadingSubLokasi(false));
            } else {
                setSubLokasiOptions([]);
            }
        } else {
            setSubLokasiOptions([]);
        }
    }, [data.lokasi, lokasiList]);

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
                keluar_info: [{ serial_number: '', status_keluar: 'dipinjamkan', sub_lokasi: '' }],
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
        <TransactionFormPage
            title="Edit Barang Keluar"
            description="Perbarui tujuan distribusi, PIC, dan unit pada transaksi ini."
            backHref={route('barang-keluar.index')}
        >
            <form onSubmit={handleSubmit} className="transaction-form-card rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                {/* Header Form (Tanggal & Lokasi) */}
                <div className="mb-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-3">
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
                        <select
                            className="mt-1 w-full rounded border p-2"
                            value={data.lokasi}
                            onChange={(e) => {
                                setData('lokasi', e.target.value);
                            }}
                        >
                            <option value="">-- Pilih Lokasi Tujuan --</option>
                            {lokasiList.map((l) => (
                                <option key={l.id} value={l.nama}>
                                    {l.nama}
                                </option>
                            ))}
                        </select>
                        {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
                    </div>
                    <div>
                        <label>PIC (Penanggung Jawab)</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded border p-2"
                            value={data.pic}
                            onChange={(e) => setData('pic', e.target.value)}
                            placeholder="Nama penanggung jawab..."
                        />
                        {errors.pic && <p className="text-sm text-red-500">{errors.pic}</p>}
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
                        subLokasiOptions={subLokasiOptions}
                        loadingSubLokasi={loadingSubLokasi}
                    />
                ))}

                {/* Tombol Aksi */}
                <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={addItemRow}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
                    >
                        + Tambah Item
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={route('barang-keluar.index')}
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
