import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Camera, Flashlight, FlashlightOff, LoaderCircle, ScanLine, Wifi, WifiOff } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

export type ScannerFeedback = {
    message: string;
    tone?: 'success' | 'warning' | 'danger' | 'info';
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDetected: (serial: string) => ScannerFeedback | void | Promise<ScannerFeedback | void>;
    continuous?: boolean;
    title?: string;
};

export function BarcodeScannerDialog({ open, onOpenChange, onDetected, continuous = false, title = 'Pindai serial number' }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<{ stop: () => void; switchTorch?: (on: boolean) => Promise<void> } | null>(null);
    const busyRef = useRef(false);
    const lastScanRef = useRef({ serial: '', at: 0 });
    const onDetectedRef = useRef(onDetected);
    const onOpenChangeRef = useRef(onOpenChange);
    const continuousRef = useRef(continuous);
    const [manual, setManual] = useState('');
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState<ScannerFeedback | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [online, setOnline] = useState(() => navigator.onLine);
    onDetectedRef.current = onDetected;
    onOpenChangeRef.current = onOpenChange;
    continuousRef.current = continuous;

    const processSerial = useCallback(async (rawSerial: string) => {
        const serial = rawSerial.trim();
        const now = Date.now();
        if (!serial || busyRef.current) return;
        if (lastScanRef.current.serial === serial && now - lastScanRef.current.at < 1500) return;

        busyRef.current = true;
        lastScanRef.current = { serial, at: now };
        try {
            const result = await onDetectedRef.current(serial);
            setFeedback(result ?? { message: `Serial ${serial} berhasil dibaca.`, tone: 'success' });
            navigator.vibrate?.(result?.tone === 'danger' ? [120, 80, 120] : 100);
            setManual('');
            if (!continuousRef.current) {
                controlsRef.current?.stop();
                window.setTimeout(() => onOpenChangeRef.current(false), 350);
            }
        } catch {
            setFeedback({ message: 'Hasil scan gagal diproses. Periksa koneksi lalu coba lagi.', tone: 'danger' });
            navigator.vibrate?.([120, 80, 120]);
        } finally {
            busyRef.current = false;
        }
    }, []);

    useEffect(() => {
        const updateOnline = () => setOnline(navigator.onLine);
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
        return () => {
            window.removeEventListener('online', updateOnline);
            window.removeEventListener('offline', updateOnline);
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setStarting(true);
        setError('');
        setFeedback(null);

        void import('@zxing/browser')
            .then(async ({ BrowserMultiFormatReader }) => {
                if (cancelled || !videoRef.current) return;
                const reader = new BrowserMultiFormatReader();
                controlsRef.current = await reader.decodeFromConstraints(
                    {
                        audio: false,
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                    },
                    videoRef.current,
                    (result) => {
                        if (!result) return;
                        void processSerial(result.getText());
                    },
                );
            })
            .catch(() => {
                if (!cancelled) setError('Kamera tidak dapat dibuka. Periksa izin kamera dan pastikan situs menggunakan HTTPS.');
            })
            .finally(() => {
                if (!cancelled) setStarting(false);
            });

        return () => {
            cancelled = true;
            controlsRef.current?.stop();
            controlsRef.current = null;
            setTorchOn(false);
            busyRef.current = false;
        };
    }, [open, processSerial]);

    const submitManual = (event: FormEvent) => {
        event.preventDefault();
        void processSerial(manual);
    };

    const toggleTorch = async () => {
        if (!controlsRef.current?.switchTorch) return;
        const next = !torchOn;
        try {
            await controlsRef.current.switchTorch(next);
            setTorchOn(next);
        } catch {
            setFeedback({ message: 'Lampu kamera tidak tersedia pada perangkat ini.', tone: 'warning' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ScanLine className="size-5 text-primary" />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>Arahkan kamera ke barcode atau QR pada label barang.</DialogDescription>
                </DialogHeader>

                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-950 sm:aspect-video">
                    <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                    <div className="pointer-events-none absolute inset-[18%] rounded-xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,.28)]" />
                    {starting && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/70 text-sm text-white">
                            <LoaderCircle className="size-5 animate-spin" />
                            Membuka kamera...
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-sm text-white">
                            <Camera className="size-8" />
                            {error}
                        </div>
                    )}
                    <div className="absolute right-3 bottom-3">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={toggleTorch}
                            disabled={!controlsRef.current?.switchTorch}
                            aria-label={torchOn ? 'Matikan lampu kamera' : 'Nyalakan lampu kamera'}
                        >
                            {torchOn ? <FlashlightOff /> : <Flashlight />}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
                    {online ? <Wifi className="size-4 text-emerald-600" /> : <WifiOff className="size-4 text-destructive" />}
                    {online ? 'Terhubung ke sistem' : 'Tidak ada koneksi. Scan tidak dapat diproses.'}
                </div>

                {feedback && (
                    <div
                        role="status"
                        className={cn(
                            'rounded-lg border px-3 py-2 text-sm',
                            feedback.tone === 'danger' && 'border-destructive/30 bg-destructive/10 text-destructive',
                            feedback.tone === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                            feedback.tone === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                            (!feedback.tone || feedback.tone === 'info') && 'border-primary/30 bg-primary/10 text-primary',
                        )}
                    >
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={submitManual} className="flex gap-2">
                    <Input
                        value={manual}
                        onChange={(event) => setManual(event.target.value)}
                        placeholder="Atau ketik serial number"
                        aria-label="Input serial number manual"
                        autoComplete="off"
                    />
                    <Button type="submit" variant="outline" disabled={!manual.trim() || busyRef.current || !online}>
                        Proses
                    </Button>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
