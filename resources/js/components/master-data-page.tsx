import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import toast from 'react-hot-toast';

type Flash = {
    message?: string;
    success?: string;
    error?: string;
};

type Props = PropsWithChildren<{
    title: string;
    description: string;
    breadcrumbs?: BreadcrumbItem[];
}>;

export function MasterDataPage({ title, description, breadcrumbs, children }: Props) {
    const { flash } = usePage<{ flash?: Flash }>().props;
    const currentUrl = usePage().url;

    useEffect(() => {
        const success = flash?.success || flash?.message;
        if (success) toast.success(success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.error, flash?.message, flash?.success]);

    const pageBreadcrumbs = breadcrumbs ?? [{ title, href: currentUrl.split('?')[0] }];

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title={title} />
            <main className="min-h-full bg-background px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Master Data</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                    </header>
                    {children}
                </div>
            </main>
        </AppLayout>
    );
}
