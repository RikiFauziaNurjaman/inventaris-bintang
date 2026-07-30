import { StockPage } from '@/components/stock-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Play } from 'lucide-react';
import { FormEvent } from 'react';

type Props = {
    lokasi: { id: number; nama: string }[];
};

export default function Create({ lokasi }: Props) {
    const form = useForm({
        tanggal: new Date().toISOString().slice(0, 10),
        lokasi_id: '',
        catatan: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('stock-opname.store'));
    };

    return (
        <StockPage
            title="Mulai Stock Opname"
            description="Buat satu sesi untuk lokasi yang akan diperiksa. Daftar stok sistem akan dibekukan saat sesi dimulai."
            actions={
                <Button asChild variant="outline">
                    <Link href={route('stock-opname.index')}>
                        <ArrowLeft />
                        Kembali
                    </Link>
                </Button>
            }
        >
            <form onSubmit={submit} className="transaction-form-card mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <Input
                            id="tanggal"
                            type="date"
                            value={form.data.tanggal}
                            onChange={(event) => form.setData('tanggal', event.target.value)}
                            aria-invalid={Boolean(form.errors.tanggal)}
                            required
                        />
                        {form.errors.tanggal && <p className="text-sm text-destructive">{form.errors.tanggal}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lokasi_id">Lokasi pemeriksaan</Label>
                        <select
                            id="lokasi_id"
                            value={form.data.lokasi_id}
                            onChange={(event) => form.setData('lokasi_id', event.target.value)}
                            className="w-full px-3 text-sm"
                            aria-invalid={Boolean(form.errors.lokasi_id)}
                            required
                        >
                            <option value="">Pilih lokasi</option>
                            {lokasi.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama}
                                </option>
                            ))}
                        </select>
                        {form.errors.lokasi_id && <p className="text-sm text-destructive">{form.errors.lokasi_id}</p>}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="catatan">Catatan</Label>
                        <textarea
                            id="catatan"
                            value={form.data.catatan}
                            onChange={(event) => form.setData('catatan', event.target.value)}
                            className="min-h-24 w-full px-3 py-2 text-sm"
                            placeholder="Tujuan atau informasi pemeriksaan (opsional)"
                            maxLength={1000}
                        />
                        {form.errors.catatan && <p className="text-sm text-destructive">{form.errors.catatan}</p>}
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t bg-muted/30 p-4 sm:flex-row sm:justify-end sm:px-6">
                    <Button asChild variant="outline">
                        <Link href={route('stock-opname.index')}>Batal</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        <Play />
                        {form.processing ? 'Menyiapkan snapshot...' : 'Mulai sesi'}
                    </Button>
                </div>
            </form>
        </StockPage>
    );
}
