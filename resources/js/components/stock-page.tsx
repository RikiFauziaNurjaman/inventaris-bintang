import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren, type ReactNode } from 'react';
import toast from 'react-hot-toast';

type Flash = {
    message?: string;
    success?: string;
    error?: string;
};

type Props = PropsWithChildren<{
    title: string;
    description: string;
    actions?: ReactNode;
}>;

export function StockFilterField({ label, children }: PropsWithChildren<{ label: string }>) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">{label}</span>
            {children}
        </label>
    );
}

export function StockPage({ title, description, actions, children }: Props) {
    const page = usePage<{ flash?: Flash }>();
    const path = page.url.split('?')[0];
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title, href: path },
    ];

    useEffect(() => {
        const success = page.props.flash?.success || page.props.flash?.message;
        if (success) toast.success(success);
        if (page.props.flash?.error) toast.error(page.props.flash.error);
    }, [page.props.flash?.error, page.props.flash?.message, page.props.flash?.success]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <main className="bg-background px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Manajemen Stok</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                        </div>
                        {actions}
                    </header>
                    {children}
                </div>
            </main>
        </AppLayout>
    );
}
