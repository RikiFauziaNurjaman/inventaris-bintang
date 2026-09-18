import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileDown,
    MapPin,
    User,
    XCircle,
} from 'lucide-react';
import { KunjunganMaintenance } from './types';

type Props = {
    kunjungan: KunjunganMaintenance | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function KunjunganDetailModal({ kunjungan, open, onOpenChange }: Props) {
    if (!kunjungan) return null;

    const details = kunjungan.details || [];
    const totalUnit = details.length;
    const countBaik = details.filter((d) => d.kondisi_fisik === 'baik').length;
    const countPerbaikan = details.filter((d) => d.kondisi_fisik === 'perlu_perbaikan').length;
    const countRusak = details.filter((d) => d.kondisi_fisik === 'rusak').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'selesai':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> Selesai
                    </span>
                );
            case 'terjadwal':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                        <Clock size={12} /> Terjadwal
                    </span>
                );
            case 'dibatalkan':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                        <XCircle size={12} /> Dibatalkan
                    </span>
                );
            default:
                return <span className="text-xs text-muted-foreground">{status}</span>;
        }
    };

    const getKondisiBadge = (kondisi: string) => {
        switch (kondisi) {
            case 'baik':
                return (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Baik
                    </span>
                );
            case 'perlu_perbaikan':
                return (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-400">
                        Perbaikan
                    </span>
                );
            case 'rusak':
                return (
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/30 dark:text-rose-400">
                        Rusak
                    </span>
                );
            default:
                return <span>{kondisi}</span>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] w-full sm:max-w-4xl lg:max-w-5xl overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="border-b pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Detail Kunjungan Maintenance
                            </DialogTitle>
                            <DialogDescription className="mt-1 font-mono text-sm text-primary">
                                {kunjungan.nomor_kunjungan}
                            </DialogDescription>
                        </div>
                        <div>{getStatusBadge(kunjungan.status)}</div>
                    </div>
                </DialogHeader>

                {/* Metadata Card */}
                <div className="mt-2 grid grid-cols-1 gap-4 rounded-xl border bg-card/60 p-4 sm:grid-cols-2">
                    <div className="space-y-3 min-w-0">
                        <div className="flex items-start gap-2.5 min-w-0">
                            <MapPin className="mt-0.5 size-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Lokasi / Pelanggan</p>
                                <p className="font-semibold text-foreground text-sm sm:text-base break-words">
                                    {kunjungan.lokasi?.nama || '-'}
                                </p>
                                {kunjungan.lokasi?.alamat && (
                                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
                                        {kunjungan.lokasi.alamat}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 min-w-0">
                            <User className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase">PIC Lokasi</p>
                                <p className="text-sm font-medium text-foreground">
                                    {kunjungan.pic_lokasi || '-'}
                                    {kunjungan.kontak_pic && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            ({kunjungan.kontak_pic})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 min-w-0 border-t pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4">
                        <div className="flex items-start gap-2.5 min-w-0">
                            <Calendar className="mt-0.5 size-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Tanggal Kunjungan</p>
                                <p className="text-sm font-semibold text-foreground">
                                    {new Date(kunjungan.tanggal_kunjungan).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Teknisi: <span className="font-medium text-foreground">{kunjungan.nama_teknisi}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 min-w-0">
                            <Clock className="mt-0.5 size-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase">
                                    Jadwal Berikutnya (Interval {kunjungan.periode_bulan} Bulan)
                                </p>
                                <p className="text-sm font-semibold text-primary">
                                    {kunjungan.jadwal_berikutnya
                                        ? new Date(kunjungan.jadwal_berikutnya).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Ringkasan Unit */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-3 text-center min-w-0">
                        <p className="text-xs text-muted-foreground truncate">Total Unit</p>
                        <p className="text-xl font-bold text-foreground">{totalUnit}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/50 p-3 text-center dark:bg-emerald-950/20 min-w-0">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate">Kondisi Baik</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{countBaik}</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-50/50 p-3 text-center dark:bg-amber-950/20 min-w-0">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 truncate">Perlu Perbaikan</p>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{countPerbaikan}</p>
                    </div>
                    <div className="rounded-lg border border-rose-500/20 bg-rose-50/50 p-3 text-center dark:bg-rose-950/20 min-w-0">
                        <p className="text-xs font-medium text-rose-700 dark:text-rose-400 truncate">Rusak / Kritis</p>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-400">{countRusak}</p>
                    </div>
                </div>

                {/* Table Daftar Printer */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        Daftar Unit Printer ({totalUnit} Unit)
                    </h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="border-b bg-muted/60 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="p-3 w-12 text-center">No</th>
                                    <th className="p-3 min-w-[140px]">Model & Merek</th>
                                    <th className="p-3 min-w-[120px]">Serial Number</th>
                                    <th className="p-3 min-w-[110px]">Ruangan</th>
                                    <th className="p-3 text-center min-w-[100px]">Kondisi</th>
                                    <th className="p-3 text-center min-w-[80px]">Counter</th>
                                    <th className="p-3 min-w-[180px]">Pemeriksaan Komponen</th>
                                    <th className="p-3 min-w-[140px]">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {details.map((item, idx) => {
                                    const modelNama = item.barang?.model_barang
                                        ? `${item.barang.model_barang.merek?.nama || ''} ${item.barang.model_barang.nama || ''}`.trim()
                                        : '-';
                                    return (
                                        <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-3 text-center font-medium text-muted-foreground">{idx + 1}</td>
                                            <td className="p-3 font-semibold text-foreground">{modelNama}</td>
                                            <td className="p-3 font-mono font-medium text-primary">
                                                {item.barang?.serial_number || '-'}
                                            </td>
                                            <td className="p-3 text-muted-foreground">
                                                {item.sub_lokasi?.nama || 'Lokasi Utama'}
                                                {item.sub_lokasi?.lantai && (
                                                    <span className="text-[10px] text-muted-foreground/80 block">
                                                        Lt. {item.sub_lokasi.lantai}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {getKondisiBadge(item.kondisi_fisik)}
                                                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                                    {item.status_operasional === 'normal'
                                                        ? 'Normal'
                                                        : item.status_operasional === 'gangguan_ringan'
                                                        ? 'Terganggu'
                                                        : 'Mati'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center font-mono font-medium">
                                                {item.counter_cetak ? item.counter_cetak.toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="p-3 text-[11px]">
                                                <div className="space-y-0.5">
                                                    <div>
                                                        <span className="text-muted-foreground">Head:</span>{' '}
                                                        <span className="font-medium text-foreground">{item.kondisi_print_head || 'Normal'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Tinta:</span>{' '}
                                                        <span className="font-medium text-foreground">{item.kondisi_tinta_ribbon || 'Cukup'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Roller:</span>{' '}
                                                        <span className="font-medium text-foreground">{item.kondisi_roller_mekanikal || 'Normal'}</span>
                                                    </div>
                                                </div>
                                                {item.catatan && (
                                                    <p className="mt-1 text-[10px] italic text-rose-600 dark:text-rose-400">
                                                        Catatan: {item.catatan}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3 text-foreground">
                                                {item.tindakan || 'Pengecekan rutin'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {details.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-6 text-center text-muted-foreground">
                                            Tidak ada rincian printer pada kunjungan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Catatan Umum */}
                {kunjungan.catatan && (
                    <div className="rounded-lg border bg-muted/40 p-3.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Catatan & Temuan Umum</p>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-line">{kunjungan.catatan}</p>
                    </div>
                )}

                <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button asChild className="gap-1.5">
                        <a
                            href={route('kunjungan-maintenance.export-pdf', kunjungan.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FileDown size={15} /> Cetak Berita Acara (PDF)
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
