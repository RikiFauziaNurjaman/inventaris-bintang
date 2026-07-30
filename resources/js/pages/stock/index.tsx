import { StockPage } from '@/components/stock-page';
import { Card, CardContent } from '@/components/ui/card';
import { PERMISSIONS } from '@/constants/permission';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, ShoppingCart, TriangleAlert, Truck, Warehouse, Wrench, type LucideIcon } from 'lucide-react';

type StockSummary = {
    gudang: number;
    distribusi: number;
    rusak: number;
    perbaikan: number;
    total: number;
    terjual: number;
};
type StockCard = {
    key: keyof StockSummary;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    tone: string;
    permission: string;
};

const cards: StockCard[] = [
    {
        key: 'gudang',
        title: 'Stok Gudang',
        description: 'Unit yang tersedia di seluruh gudang.',
        href: '/stok-gudang',
        icon: Warehouse,
        tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        permission: PERMISSIONS.VIEW_STOK_GUDANG,
    },
    {
        key: 'distribusi',
        title: 'Stok Distribusi',
        description: 'Unit yang berada di lokasi distribusi.',
        href: '/stok-distribusi',
        icon: Truck,
        tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        permission: PERMISSIONS.VIEW_STOK_DISTRIBUSI,
    },
    {
        key: 'total',
        title: 'Total Barang',
        description: 'Seluruh unit inventaris yang tercatat.',
        href: '/total-stock',
        icon: Boxes,
        tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
        permission: PERMISSIONS.VIEW_STOK_TOTAL,
    },
    {
        key: 'terjual',
        title: 'Stok Terjual',
        description: 'Unit yang telah selesai dijual.',
        href: '/stok-terjual',
        icon: ShoppingCart,
        tone: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
        permission: PERMISSIONS.VIEW_STOK_TERJUAL,
    },
    {
        key: 'rusak',
        title: 'Stok Rusak',
        description: 'Unit rusak yang menunggu tindak lanjut.',
        href: '/stock-rusak',
        icon: TriangleAlert,
        tone: 'bg-destructive/10 text-destructive',
        permission: PERMISSIONS.VIEW_STOK_RUSAK,
    },
    {
        key: 'perbaikan',
        title: 'Dalam Perbaikan',
        description: 'Unit yang sedang menjalani perbaikan.',
        href: '/perbaikan',
        icon: Wrench,
        tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        permission: PERMISSIONS.VIEW_STOK_DIPERBAIKI,
    },
];

export default function StockIndex() {
    const { auth, summary } = usePage<{ auth: { permissions?: string[] }; summary: StockSummary }>().props;
    const permissions = auth.permissions ?? [];
    const visibleCards = cards.filter((card) => permissions.includes(card.permission));

    return (
        <StockPage title="Ringkasan Stok" description="Pantau posisi dan kondisi inventaris dari satu tempat.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                                <CardContent className="flex h-full flex-col gap-4 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={cn('flex size-11 items-center justify-center rounded-lg', card.tone)}>
                                            <Icon className="size-5" />
                                        </div>
                                        <span className="text-3xl font-semibold tracking-tight text-foreground">
                                            {summary[card.key].toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h2 className="font-semibold text-foreground">{card.title}</h2>
                                        <p className="text-sm text-muted-foreground">{card.description}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                        Lihat stok
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </StockPage>
    );
}
