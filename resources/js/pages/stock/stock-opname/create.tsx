import { StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Lokasi = {
    id: number;
    nama: string;
};

type ModelBarang = {
    id: number;
    nama: string;
    merek?: { nama: string };
    kategori?: { nama: string };
};

type StockOpnameForm = {
    tanggal: string;
    lokasi_id: string;
    catatan: string;
    details: {
        model_id: string;
        serial_numbers: string[];
    }[];
};

type Props = {
    lokasi: Lokasi[];
    modelBarang: ModelBarang[];
    serialPerModel: Record<string, string[]>;
};

export default function Create({ lokasi, modelBarang, serialPerModel }: Props) {
    const { data, setData, post, processing, errors } = useForm<StockOpnameForm>({
        tanggal: '',
        lokasi_id: '',
        catatan: '',
        details: [],
    });
    const [currentModel, setCurrentModel] = useState('');
    const [serialInput, setSerialInput] = useState('');
    const [serialsFisik, setSerialsFisik] = useState<string[]>([]);
    const [availableSerials, setAvailableSerials] = useState<string[]>([]);

    useEffect(() => {
        const serials = serialPerModel[currentModel] || [];
        setAvailableSerials(serials.filter((serial) => !serialsFisik.includes(serial)));
        setSerialInput('');
    }, [currentModel, serialPerModel, serialsFisik]);

    const addSerial = () => {
        const serial = serialInput.trim();
        if (!serial || serialsFisik.includes(serial)) return;
        if (!availableSerials.includes(serial)) {
            toast.error('Serial number tidak valid untuk model ini.');
            return;
        }
        setSerialsFisik((current) => [...current, serial]);
    };

    const addDetail = () => {
        if (!currentModel || !serialsFisik.length) return;
        setData('details', [...data.details, { model_id: currentModel, serial_numbers: serialsFisik }]);
        setCurrentModel('');
        setSerialsFisik([]);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('stock-opname.store'));
    };

    return (
        <StockPage
            title="Tambah Stock Opname"
            description="Catat hasil pemeriksaan fisik per model dan serial number pada satu lokasi."
            actions={
                <Button asChild variant="outline">
                    <Link href={route('stock-opname.index')}>
                        <ArrowLeft />
                        Kembali
                    </Link>
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="transaction-form-card overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="grid gap-5 border-b p-5 sm:grid-cols-2 sm:p-6">
                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <Input id="tanggal" type="date" value={data.tanggal} onChange={(event) => setData('tanggal', event.target.value)} required />
                        {errors.tanggal && <p className="text-sm text-destructive">{errors.tanggal}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lokasi">Lokasi</Label>
                        <select
                            id="lokasi"
                            value={data.lokasi_id}
                            onChange={(event) => setData('lokasi_id', event.target.value)}
                            className="w-full px-3 text-sm"
                            required
                        >
                            <option value="">Pilih lokasi</option>
                            {lokasi.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama}
                                </option>
                            ))}
                        </select>
                        {errors.lokasi_id && <p className="text-sm text-destructive">{errors.lokasi_id}</p>}
                    </div>
                </div>

                <section className="space-y-5 border-b p-5 sm:p-6" aria-labelledby="input-fisik">
                    <div>
                        <h2 id="input-fisik" className="font-semibold text-foreground">
                            Input serial fisik
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">Pilih model, lalu scan atau masukkan serial yang ditemukan.</p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="model">Model Barang</Label>
                            <select
                                id="model"
                                value={currentModel}
                                onChange={(event) => setCurrentModel(event.target.value)}
                                className="w-full px-3 text-sm"
                            >
                                <option value="">Pilih model barang</option>
                                {modelBarang.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        [{model.kategori?.nama || 'Tanpa kategori'}] {model.merek?.nama} {model.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial">Serial Number</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="serial"
                                    list="serial-suggestion"
                                    value={serialInput}
                                    onChange={(event) => setSerialInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            addSerial();
                                        }
                                    }}
                                    placeholder="Scan atau input serial"
                                />
                                <datalist id="serial-suggestion">
                                    {availableSerials.map((serial) => (
                                        <option key={serial} value={serial} />
                                    ))}
                                </datalist>
                                <Button type="button" variant="outline" onClick={addSerial} disabled={!currentModel || !serialInput.trim()}>
                                    <Plus />
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Serial fisik sementara</Label>
                        <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-xl border border-dashed bg-muted/30 p-3">
                            {serialsFisik.length ? (
                                serialsFisik.map((serial) => (
                                    <span
                                        key={serial}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pr-1 pl-3 font-mono text-xs text-primary"
                                    >
                                        {serial}
                                        <button
                                            type="button"
                                            onClick={() => setSerialsFisik((current) => current.filter((item) => item !== serial))}
                                            className="inline-flex size-6 items-center justify-center rounded-full hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                            aria-label={`Hapus serial ${serial}`}
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">Belum ada serial yang ditambahkan.</span>
                            )}
                        </div>
                    </div>

                    <Button type="button" variant="secondary" onClick={addDetail} disabled={!currentModel || !serialsFisik.length}>
                        <Plus />
                        Tambahkan ke daftar opname
                    </Button>
                </section>

                <section className="space-y-4 border-b p-5 sm:p-6" aria-labelledby="daftar-opname">
                    <div className="flex items-center justify-between">
                        <h2 id="daftar-opname" className="font-semibold text-foreground">
                            Daftar barang
                        </h2>
                        <span className="text-xs font-medium text-muted-foreground">{data.details.length} model</span>
                    </div>
                    {data.details.length ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {data.details.map((detail, index) => {
                                const model = modelBarang.find((item) => item.id.toString() === detail.model_id);
                                return (
                                    <article key={`${detail.model_id}-${index}`} className="rounded-xl border bg-muted/20 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-medium text-foreground">
                                                    [{model?.kategori?.nama || 'Tanpa kategori'}] {model?.merek?.nama} {model?.nama}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">{detail.serial_numbers.length} serial fisik</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setData(
                                                        'details',
                                                        data.details.filter((_, itemIndex) => itemIndex !== index),
                                                    )
                                                }
                                                aria-label={`Hapus ${model?.nama || 'model'} dari daftar`}
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {detail.serial_numbers.map((serial) => (
                                                <span
                                                    key={serial}
                                                    className="rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground"
                                                >
                                                    {serial}
                                                </span>
                                            ))}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                            Belum ada barang dalam daftar opname.
                        </div>
                    )}
                </section>

                <div className="space-y-2 p-5 sm:p-6">
                    <Label htmlFor="catatan">Catatan Umum</Label>
                    <textarea
                        id="catatan"
                        value={data.catatan}
                        onChange={(event) => setData('catatan', event.target.value)}
                        className="min-h-24 w-full px-3 py-2 text-sm"
                        placeholder="Tambahkan catatan bila diperlukan"
                    />
                </div>

                <footer className="flex flex-col-reverse gap-2 border-t bg-muted/30 p-4 sm:flex-row sm:justify-end sm:px-6">
                    <Button asChild variant="outline">
                        <Link href={route('stock-opname.index')}>Batal</Link>
                    </Button>
                    <Button type="submit" disabled={processing || !data.details.length}>
                        <Save />
                        {processing ? 'Menyimpan...' : 'Simpan stock opname'}
                    </Button>
                </footer>
            </form>
        </StockPage>
    );
}
