import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CalendarPlus,
    CheckCircle2,
    Clock,
    Printer,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

export default function NotificationBell() {
    const { maintenanceNotifications } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);

    const unreadCount = maintenanceNotifications?.unread_count ?? 0;
    const overdueCount = maintenanceNotifications?.overdue_count ?? 0;
    const dueSoonCount = maintenanceNotifications?.due_soon_count ?? 0;
    const items = maintenanceNotifications?.items ?? [];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9 rounded-full hover:bg-accent/70 transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Notifikasi Jadwal Maintenance"
                >
                    <Bell className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />

                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center">
                            {overdueCount > 0 && (
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            )}
                            <span
                                className={`relative inline-flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold text-white leading-none shadow-sm ${
                                    overdueCount > 0 ? 'bg-rose-600' : 'bg-amber-500'
                                }`}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[360px] sm:w-[420px] p-0 shadow-2xl border border-border/80 rounded-xl overflow-hidden backdrop-blur-md bg-background/95"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Wrench className="size-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Jadwal Maintenance</h4>
                            <p className="text-[11px] text-muted-foreground">Pemeriksaan printer berkala (3/6 bln)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {overdueCount > 0 && (
                            <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-medium">
                                {overdueCount} Lewat
                            </Badge>
                        )}
                        {dueSoonCount > 0 && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-1.5 py-0 text-[10px] font-medium">
                                {dueSoonCount} Segera
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Items List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Semua Jadwal Aman</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Seluruh printer di lokasi pelanggan berada dalam siklus kunjungan yang sesuai jadwal.
                            </p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const isOverdue = item.type === 'overdue';
                            return (
                                <div
                                    key={item.lokasi_id}
                                    className="p-3.5 hover:bg-muted/40 transition-colors flex flex-col gap-2 group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                {isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900 shrink-0">
                                                        <AlertTriangle className="size-3" />
                                                        Lewat {item.diff_in_days} hr
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900 shrink-0">
                                                        <Clock className="size-3" />
                                                        Dalam {item.diff_in_days} hr
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto shrink-0">
                                                    <Printer className="size-3" />
                                                    {item.total_printer} unit
                                                </span>
                                            </div>

                                            <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate pt-1">
                                                {item.lokasi_nama}
                                            </h5>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-md">
                                        <div>
                                            Target: <span className="font-medium text-foreground">{item.jadwal_berikutnya}</span>
                                        </div>
                                        <div>
                                            Terakhir:{' '}
                                            {item.kunjungan_terakhir ? (
                                                <span className="font-medium text-foreground">{item.kunjungan_terakhir}</span>
                                            ) : (
                                                <span className="font-semibold text-amber-600 dark:text-amber-400">Belum pernah</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-0.5">
                                        <Link
                                            href={`/kunjungan-maintenance/create?lokasi_id=${item.lokasi_id}`}
                                            onClick={() => setOpen(false)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                                        >
                                            <CalendarPlus className="size-3.5" />
                                            Catat Kunjungan
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-3.5 py-2.5">
                    <span className="text-[11px] text-muted-foreground">
                        Total {items.length} lokasi perlu perhatian
                    </span>
                    <Link
                        href="/kunjungan-maintenance?tab=jadwal"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        Lihat Semua Jadwal
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
