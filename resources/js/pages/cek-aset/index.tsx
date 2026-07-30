import { BarcodeScannerDialog, ScannerFeedback } from '@/components/barcode-scanner-dialog';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Camera, CheckCircle2, MapPin, PackageSearch, Search, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

type AssetResult = {
    registered: boolean;
    serial_number?: string;
    location_match?: boolean | null;
    barang?: {
        id: number;
        serial_number: string;
        model?: string | null;
        merek?: string | null;
        status: string;
        lokasi?: string | null;
        rak?: string | null;
        sub_lokasi?: string | null;
    };
};

export default function CekAset({ lokasi }: { lokasi: { id: number; nama: string }[] }) {
    const [serial, setSerial] = useState('');
    const [lokasiId, setLokasiId] = useState('');
    const [result, setResult] = useState<AssetResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    const lookup = async (value: string): Promise<ScannerFeedback> => {
        setLoading(true);
        try {
            const response = await axios.get<AssetResult>(route('cek-aset.lookup'), {
                params: { serial_number: value, lokasi_id: lokasiId || undefined },
            });
            setResult(response.data);
            setSerial(value);

            if (!response.data.registered) return { message: `${value} tidak terdaftar di sistem.`, tone: 'danger' };
            if (response.data.location_match === false) {
                return { message: `${value} terdaftar, tetapi lokasi sistem tidak sesuai.`, tone: 'warning' };
            }
            return { message: `${value} terdaftar di sistem.`, tone: 'success' };
        } finally {
            setLoading(false);
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (serial.trim()) void lookup(serial);
    };

    return (
        <StockPage title="Cek Aset" description="Pindai label printer untuk memastikan aset terdaftar dan berada di lokasi yang sesuai.">
            <div className="grid gap-4 xl:grid-cols-[minmax(20rem,.7fr)_minmax(0,1.3fr)]">
                <Card className="h-fit">
                    <CardContent className="space-y-5 p-5 sm:p-6">
                        <div className="space-y-2">
                            <Label htmlFor="lokasi-kunjungan">Lokasi kunjungan</Label>
                            <select
                                id="lokasi-kunjungan"
                                value={lokasiId}
                                onChange={(event) => {
                                    setLokasiId(event.target.value);
                                    setResult(null);
                                }}
                                className="w-full px-3 text-sm"
                            >
                                <option value="">Tanpa perbandingan lokasi</option>
                                {lokasi.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button type="button" size="lg" className="h-14 w-full" onClick={() => setScannerOpen(true)}>
                            <Camera className="size-5" />
                            Buka kamera pemindai
                        </Button>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                            atau input manual
                        </div>
                        <form onSubmit={submit} className="space-y-2">
                            <Label htmlFor="serial-aset">Serial number</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="serial-aset"
                                    value={serial}
                                    onChange={(event) => setSerial(event.target.value)}
                                    className="font-mono"
                                    placeholder="Masukkan serial number"
                                    autoComplete="off"
                                />
                                <Button type="submit" variant="outline" disabled={!serial.trim() || loading} aria-label="Cari aset">
                                    <Search />
                                </Button>
                            </div>
                        </form>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Pemeriksaan ini hanya membaca data terkini dan tidak menyimpan riwayat kunjungan.
                        </p>
                    </CardContent>
                </Card>

                <section className="min-h-96 rounded-2xl border bg-card p-5 shadow-sm sm:p-6" aria-live="polite">
                    {loading ? (
                        <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">Memeriksa aset...</div>
                    ) : !result ? (
                        <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                            <PackageSearch className="size-12 stroke-1" />
                            <div>
                                <p className="font-medium text-foreground">Belum ada aset diperiksa</p>
                                <p className="mt-1 text-sm">Scan barcode atau masukkan serial number.</p>
                            </div>
                        </div>
                    ) : !result.registered ? (
                        <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
                            <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                <XCircle className="size-8" />
                            </span>
                            <div>
                                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                                    Tidak terdaftar
                                </Badge>
                                <h2 className="mt-3 font-mono text-xl font-semibold">{result.serial_number}</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Serial ini tidak ditemukan pada data inventaris.</p>
                            </div>
                        </div>
                    ) : (
                        <AssetDetails result={result} />
                    )}
                </section>
            </div>

            <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={lookup} title="Pindai label aset" />
        </StockPage>
    );
}

function AssetDetails({ result }: { result: AssetResult }) {
    const barang = result.barang!;
    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-emerald-600 text-white">
                            <CheckCircle2 />
                            Terdaftar
                        </Badge>
                        {result.location_match === true && (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                                Lokasi sesuai
                            </Badge>
                        )}
                        {result.location_match === false && (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400">
                                Lokasi tidak sesuai
                            </Badge>
                        )}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">
                        {barang.merek} {barang.model}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">{barang.serial_number}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                    <MapPin className="size-4" />
                    {barang.lokasi || 'Tanpa lokasi'}
                </span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
                {[
                    ['Status', barang.status],
                    ['Lokasi sistem', barang.lokasi || '—'],
                    ['Sub-lokasi', barang.sub_lokasi || '—'],
                    ['Rak', barang.rak || '—'],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-muted/50 px-4 py-3">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 text-sm font-medium">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
