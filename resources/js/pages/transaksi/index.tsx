import { TransactionPage } from '@/components/transaction-page';
import { Card, CardContent } from '@/components/ui/card';
import { PERMISSIONS } from '@/constants/permission';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, PackagePlus, Truck, Undo2, type LucideIcon } from 'lucide-react';

type TransactionCard = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone: string;
    permission: string;
};

const cards: TransactionCard[] = [
    {
        title: 'Barang Masuk',
        description: 'Catat penerimaan unit baru beserta serial number dan lokasi gudangnya.',
        href: '/barang-masuk',
        icon: PackagePlus,
        tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        permission: PERMISSIONS.VIEW_BARANG_MASUK,
    },
    {
        title: 'Barang Keluar',
        description: 'Kelola distribusi, peminjaman, penjualan, dan dokumen barang keluar.',
        href: '/barang-keluar',
        icon: Truck,
        tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        permission: PERMISSIONS.VIEW_BARANG_KELUAR,
    },
    {
        title: 'Barang Kembali',
        description: 'Catat pengembalian unit dan kondisi aktualnya setelah digunakan.',
        href: '/barang-kembali',
        icon: Undo2,
        tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        permission: PERMISSIONS.VIEW_BARANG_KEMBALI,
    },
];

export default function TransaksiIndex() {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const visibleCards = cards.filter((card) => permissions.includes(card.permission));

    return (
        <TransactionPage title="Ringkasan Transaksi" description="Pilih alur transaksi inventaris yang ingin dikerjakan.">
            {visibleCards.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                                    <CardContent className="flex h-full flex-col gap-5 p-6">
                                        <div className={cn('flex size-11 items-center justify-center rounded-lg', card.tone)}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <h2 className="font-semibold text-foreground">{card.title}</h2>
                                            <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                            Buka transaksi
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        Anda belum memiliki akses ke transaksi inventaris.
                    </CardContent>
                </Card>
            )}
        </TransactionPage>
    );
}
