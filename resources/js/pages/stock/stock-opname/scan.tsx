import { BarcodeScannerDialog, ScannerFeedback } from '@/components/barcode-scanner-dialog';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { StockPage } from '@/components/stock-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permission';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Camera, Check, RotateCcw, ScanLine, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type OpnameItem = {
    id: number;
    serial_number: string;
    state: ScanState;
    status_snapshot?: string | null;
    scanned_at?: string | null;
    model?: { nama: string; merek?: string | null } | null;
    lokasi_sistem?: string | null;
    scanned_by?: { id: number; name: string } | null;
};

type ScanState = 'pending' | 'found' | 'wrong_location' | 'unexpected' | 'unknown';

type Progress = {
    status: 'active' | 'submitted' | 'approved' | 'cancelled';
    expected: number;
    found: number;
    pending: number;
    wrong_location: number;
    unexpected: number;
    unknown: number;
    percent: number;
    contributors: { id: number; name: string }[];
    recent: OpnameItem[];
};

type Props = {
    data: {
        id: number;
        tanggal: string;
        lokasi: { nama: string };
        user: { id: number; name: string };
        user_id: number;
        status: Progress['status'];
        started_at?: string;
    };
    progress: Progress;
};

const stateLabels: Record<ScanState, string> = {
    pending: 'Belum ditemukan',
    found: 'Ditemukan',
    wrong_location: 'Salah lokasi',
    unexpected: 'Tidak diharapkan',
    unknown: 'Tidak terdaftar',
};

export default function Scan({ data, progress: initialProgress }: Props) {
    const page = usePage<{ auth: { user: { id: number }; permissions?: string[] } }>();
    const permissions = page.props.auth.permissions ?? [];
    const canManage = page.props.auth.user.id === data.user_id || permissions.includes(PERMISSIONS.EDIT_STOCK_OPNAME);
    const [progress, setProgress] = useState(initialProgress);
    const [serial, setSerial] = useState('');
    const [scannerOpen, setScannerOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    useEffect(() => {
        if (progress.status !== 'active') return;

        const refresh = async () => {
            if (document.hidden) return;
            try {
                const response = await axios.get<Progress>(route('stock-opname.progress', data.id));
                setProgress(response.data);
            } catch {
                // The next polling cycle retries automatically.
            }
        };

        const interval = window.setInterval(refresh, 4000);
        return () => window.clearInterval(interval);
    }, [data.id, progress.status]);

    const processSerial = async (value: string): Promise<ScannerFeedback> => {
        const response = await axios.post<{ result: ScanState | 'duplicate'; item: OpnameItem; progress: Progress }>(
            route('stock-opname.scans.store', data.id),
            { serial_number: value },
        );
        setProgress(response.data.progress);
        setSerial('');

        const feedback: Record<string, ScannerFeedback> = {
            found: { message: `${response.data.item.serial_number} ditemukan dan dicatat.`, tone: 'success' },
            duplicate: { message: `${response.data.item.serial_number} sudah pernah dipindai pada sesi ini.`, tone: 'warning' },
            wrong_location: {
                message: `${response.data.item.serial_number} terdaftar di ${response.data.item.lokasi_sistem || 'lokasi lain'}.`,
                tone: 'warning',
            },
            unexpected: { message: `${response.data.item.serial_number} terdaftar tetapi tidak termasuk stok expected.`, tone: 'warning' },
            unknown: { message: `${response.data.item.serial_number} tidak terdaftar di sistem.`, tone: 'danger' },
        };
        return feedback[response.data.result];
    };

    const submitManual = async (event: FormEvent) => {
        event.preventDefault();
        if (!serial.trim() || processing) return;
        setProcessing(true);
        try {
            const feedback = await processSerial(serial);
            if (feedback.tone === 'danger') toast.error(feedback.message);
            else toast.success(feedback.message);
        } catch {
            toast.error('Serial gagal diproses. Periksa koneksi dan coba kembali.');
        } finally {
            setProcessing(false);
        }
    };

    const undo = async (item: OpnameItem) => {
        try {
            const response = await axios.delete<{ progress: Progress }>(route('stock-opname.scans.destroy', [data.id, item.id]));
            setProgress(response.data.progress);
            toast.success(`Scan ${item.serial_number} dibatalkan.`);
        } catch {
            toast.error('Scan tidak dapat dibatalkan.');
        }
    };

    const active = progress.status === 'active';

    return (
        <StockPage
            title={`Opname ${data.lokasi.nama}`}
            description={`Sesi kolaboratif oleh ${data.user.name}. Setiap serial hanya dihitung satu kali.`}
            actions={
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href={route('stock-opname.index')}>
                            <ArrowLeft />
                            Daftar sesi
                        </Link>
                    </Button>
                    {active && canManage && (
                        <>
                            <Button type="button" variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)}>
                                Batalkan sesi
                            </Button>
                            <Button type="button" onClick={() => setSubmitOpen(true)}>
                                <Check />
                                Kirim untuk review
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {[
                    ['Expected', progress.expected],
                    ['Ditemukan', progress.found],
                    ['Belum ditemukan', progress.pending],
                    ['Salah lokasi', progress.wrong_location],
                    ['Tidak diharapkan', progress.unexpected],
                    ['Tidak terdaftar', progress.unknown],
                ].map(([label, value]) => (
                    <Card key={label}>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-1 text-2xl font-semibold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)]">
                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Mode scan</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Gunakan kamera atau input serial secara manual.</p>
                            </div>
                            <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Sesi aktif' : progress.status}</Badge>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-label={`Progres ${progress.percent}%`}>
                            <div className="h-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{progress.percent}% selesai</span>
                            <span>
                                {progress.found} dari {progress.expected}
                            </span>
                        </div>
                    </div>

                    {active ? (
                        <div className="space-y-4 p-5">
                            <Button type="button" size="lg" className="h-14 w-full text-base" onClick={() => setScannerOpen(true)}>
                                <Camera className="size-5" />
                                Buka kamera pemindai
                            </Button>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                                atau input manual
                            </div>
                            <form onSubmit={submitManual} className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    value={serial}
                                    onChange={(event) => setSerial(event.target.value)}
                                    placeholder="Masukkan serial number lalu tekan Enter"
                                    className="h-12 font-mono"
                                    autoFocus
                                    autoComplete="off"
                                />
                                <Button type="submit" variant="outline" className="h-12" disabled={!serial.trim() || processing}>
                                    <ScanLine />
                                    {processing ? 'Memproses...' : 'Proses serial'}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">Sesi tidak aktif. Pemindaian baru sudah dikunci.</div>
                    )}

                    <div className="border-t">
                        <div className="flex items-center justify-between px-5 py-4">
                            <h2 className="font-semibold">Scan terbaru</h2>
                            <span className="text-xs text-muted-foreground">Diperbarui otomatis</span>
                        </div>
                        <div className="divide-y">
                            {progress.recent.map((item) => {
                                const canUndo = active && (canManage || item.scanned_by?.id === page.props.auth.user.id);
                                return (
                                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                                        <StateMarker state={item.state} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-mono text-sm font-medium">{item.serial_number}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {item.model ? `${item.model.merek || ''} ${item.model.nama}`.trim() : 'Model tidak diketahui'} ·{' '}
                                                {item.scanned_by?.name || 'Petugas'}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="hidden sm:inline-flex">
                                            {stateLabels[item.state]}
                                        </Badge>
                                        {canUndo && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => void undo(item)}
                                                aria-label={`Batalkan scan ${item.serial_number}`}
                                            >
                                                <RotateCcw />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                            {!progress.recent.length && (
                                <div className="px-5 py-12 text-center text-sm text-muted-foreground">Belum ada serial yang dipindai.</div>
                            )}
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Users className="size-5 text-primary" />
                        <h2 className="font-semibold">Kontributor</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{progress.contributors.length} petugas telah melakukan scan.</p>
                    <div className="mt-4 space-y-2">
                        {progress.contributors.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {user.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="truncate text-sm font-medium">{user.name}</span>
                            </div>
                        ))}
                        {!progress.contributors.length && <p className="py-5 text-center text-sm text-muted-foreground">Belum ada kontributor.</p>}
                    </div>
                </aside>
            </div>

            <BarcodeScannerDialog
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onDetected={processSerial}
                continuous
                title={`Scan opname ${data.lokasi.nama}`}
            />

            <ConfirmDeleteDialog
                open={submitOpen}
                onOpenChange={setSubmitOpen}
                title="Kirim stock opname untuk review?"
                description={`${progress.pending} barang expected belum ditemukan. Setelah dikirim, scan akan dikunci sampai sesi dibuka kembali.`}
                confirmLabel="Kirim untuk review"
                confirmVariant="default"
                processing={processing}
                onConfirm={() => {
                    setProcessing(true);
                    router.post(
                        route('stock-opname.submit', data.id),
                        {},
                        { onFinish: () => setProcessing(false), onSuccess: () => setSubmitOpen(false) },
                    );
                }}
            />

            <ConfirmDeleteDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title="Batalkan sesi opname?"
                description="Sesi dan hasil scan akan dipertahankan sebagai audit berstatus dibatalkan."
                confirmLabel="Batalkan sesi"
                processing={processing}
                onConfirm={() => {
                    setProcessing(true);
                    router.delete(route('stock-opname.destroy', data.id), { onFinish: () => setProcessing(false) });
                }}
            />
        </StockPage>
    );
}

function StateMarker({ state }: { state: ScanState }) {
    const classes: Record<ScanState, string> = {
        pending: 'bg-muted-foreground',
        found: 'bg-emerald-500',
        wrong_location: 'bg-amber-500',
        unexpected: 'bg-orange-500',
        unknown: 'bg-destructive',
    };
    return <span className={`size-2.5 shrink-0 rounded-full ${classes[state]}`} aria-hidden="true" />;
}
