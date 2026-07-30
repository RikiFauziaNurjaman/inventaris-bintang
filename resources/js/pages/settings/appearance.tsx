import AppearanceTabs from '@/components/appearance-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan', href: '/settings/profile' },
    { title: 'Tampilan', href: '/settings/appearance' },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Tampilan" />
            <SettingsLayout>
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                <Palette className="size-5" />
                            </span>
                            <div className="space-y-1">
                                <CardTitle>Tema Aplikasi</CardTitle>
                                <CardDescription>Pilih tampilan yang paling nyaman untuk lingkungan kerja Anda.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AppearanceTabs />
                    </CardContent>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
