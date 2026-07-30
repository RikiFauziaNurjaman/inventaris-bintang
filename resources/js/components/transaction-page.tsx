import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
}>;

type FormPageProps = Props & {
    backHref: string;
};

export function TransactionFilterField({ label, children }: PropsWithChildren<{ label: string }>) {
    return (
        <label className="block space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">{label}</span>
            {children}
        </label>
    );
}

export function TransactionPage({ title, description, children }: Props) {
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
                    <header className="space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Transaksi</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                    </header>
                    {children}
                </div>
            </main>
        </AppLayout>
    );
}

export function TransactionFormPage({ title, description, backHref, children }: FormPageProps) {
    const path = usePage().url.split('?')[0];
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title, href: path },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <main className="transaction-form px-4 py-6 sm:px-6 lg:px-8">
                <div className="w-full space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Form Transaksi</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={backHref}>
                                <ArrowLeft />
                                Kembali
                            </Link>
                        </Button>
                    </header>
                    {children}
                </div>
            </main>
        </AppLayout>
    );
}
