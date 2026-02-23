import { BulkSerialInput } from '@/components/transaksi/BulkSerialInput';
import { showTransactionPreview } from '@/components/transaksi/TransactionPreview';
import AppLayout from '@/layouts/app-layout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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

// Komponen untuk satu baris item
const ItemRow = ({ item, index, onItemChange, onRemove, errors, lists, usedModels }) => {
    const [loadingMerek, setLoadingMerek] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);

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

    const handleBulkSerials = (serials: string[]) => {
        const newKeluarInfo = [
            ...item.keluar_info.filter((info) => info.serial_number.trim()),
            ...serials.map((sn) => ({ serial_number: sn, status_keluar: 'dipinjamkan' as const })),
        ];
        onItemChange(index, {
            ...item,
            keluar_info: newKeluarInfo.length > 0 ? newKeluarInfo : [{ serial_number: '', status_keluar: 'dipinjamkan' }],
        });
    };

    return (
        <div className="relative mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Item #{index + 1}</h3>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
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
                    {errors.kategori && <p className="text-xs text-red-500">{errors.kategori}</p>}
                </div>

                {/* Merek */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merek</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
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
                    {errors.merek && <p className="text-xs text-red-500">{errors.merek}</p>}
                </div>

                {/* Model */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
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
                    {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
                </div>
            </div>

            {/* Serial Numbers & Status */}
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800 dark:text-white">
                        Serial Number & Status
                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {item.keluar_info.filter((i) => i.serial_number.trim()).length} unit
                        </span>
                    </label>
                    <BulkSerialInput existingSerials={item.keluar_info.map((i) => i.serial_number)} onSerialsParsed={handleBulkSerials} />
                </div>
                {item.keluar_info.map((info, infoIndex) => (
                    <div key={infoIndex} className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
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
                                value={info.status_keluar}
                                onChange={(e) => handleKeluarInfoChange(infoIndex, 'status_keluar', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                            >
                                <option value="dipinjamkan">Dipinjamkan</option>
                                <option value="dijual">Dijual</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                ))}
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
            </div>
        </div>
    );
};

export default function BarangKeluarCreate() {
    const { lokasiList, kategoriList, merekList, modelList, serialNumberList } = usePage().props as any;

    const [subLokasiOptions, setSubLokasiOptions] = useState<{ id: number; nama: string; lantai: string | null }[]>([]);
    const [loadingSubLokasi, setLoadingSubLokasi] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: new Date().toISOString().slice(0, 10),
        lokasi: '',
        sub_lokasi: '',
        pic: '',
        items: [
            {
                kategori: '',
                merek: '',
                model: '',
                keluar_info: [{ serial_number: '', status_keluar: 'dipinjamkan' }],
            },
        ] as Item[],
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

    const handleItemChange = (index, updatedItem) => {
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

    const removeItemRow = (index) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmed = await showTransactionPreview(data, 'keluar');
        if (!confirmed) return;

        post(route('barang-keluar.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Data barang keluar berhasil disimpan!',
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset();
            },
            onError: () => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Periksa kembali isian form Anda.' });
            },
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 dark:bg-zinc-950">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Transaksi Barang Keluar</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Distribusikan barang ke lokasi tujuan</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        {/* Header Form */}
                        <div className="mb-6 grid grid-cols-1 gap-6 border-b border-gray-100 pb-6 md:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan Distribusi</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.lokasi}
                                    onChange={(e) => {
                                        setData('lokasi', e.target.value);
                                        setData('sub_lokasi', '');
                                    }}
                                >
                                    <option value="">-- Pilih Lokasi Tujuan --</option>
                                    {lokasiList.map((l) => (
                                        <option key={l.id} value={l.nama}>
                                            {l.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasi && <p className="text-xs text-red-500">{errors.lokasi}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sub-Lokasi
                                    {loadingSubLokasi && <span className="ml-2 text-xs text-gray-400">(memuat...)</span>}
                                </label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-700"
                                    value={data.sub_lokasi}
                                    onChange={(e) => setData('sub_lokasi', e.target.value)}
                                    disabled={!data.lokasi || subLokasiOptions.length === 0}
                                >
                                    <option value="">-- Pilih Sub-Lokasi --</option>
                                    {subLokasiOptions.map((s) => (
                                        <option key={s.id} value={s.nama}>
                                            {s.nama} {s.lantai ? `(Lt. ${s.lantai})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.sub_lokasi && <p className="text-xs text-red-500">{errors.sub_lokasi}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PIC (Penanggung Jawab)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                                    value={data.pic}
                                    onChange={(e) => setData('pic', e.target.value)}
                                    placeholder="Nama penanggung jawab..."
                                />
                                {errors.pic && <p className="text-xs text-red-500">{errors.pic}</p>}
                            </div>
                        </div>

                        {/* Daftar Item */}
                        {data.items.map((item, index) => {
                            const itemErrors = {};
                            const prefix = `items.${index}.`;
                            for (const key in errors) {
                                if (key.startsWith(prefix)) {
                                    const newKey = key.substring(prefix.length);
                                    itemErrors[newKey] = errors[key];
                                }
                            }
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
                                    errors={itemErrors}
                                    lists={{ kategoriList, merekList, modelList, serialNumberList }}
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
                                Tambah Item
                            </button>

                            <div className="flex gap-3">
                                <Link
                                    href={route('barang-keluar.index')}
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
