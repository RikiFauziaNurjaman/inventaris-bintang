import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, ExternalLink, HardDrive, Monitor, Printer, Wifi } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Driver',
        href: '/driver',
    },
];

const GOOGLE_DRIVE_URL = 'https://drive.google.com/drive/folders/1YA0_p-atY3BqD_7YndV_Ls4NpulAC77a?usp=sharing';

const driverCategories = [
    {
        title: 'Printer Driver',
        description: 'Driver untuk perangkat printer yang digunakan di perusahaan',
        icon: Printer,
        color: 'blue',
    },
    {
        title: 'Network Driver',
        description: 'Driver untuk perangkat jaringan dan konektivitas',
        icon: Wifi,
        color: 'emerald',
    },
    {
        title: 'Display Driver',
        description: 'Driver untuk monitor dan perangkat display',
        icon: Monitor,
        color: 'violet',
    },
    {
        title: 'Lainnya',
        description: 'Driver perangkat lainnya yang diperlukan',
        icon: HardDrive,
        color: 'amber',
    },
];

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        darkBg: 'dark:bg-blue-900',
        darkText: 'dark:text-blue-400',
    },
    emerald: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-600',
        darkBg: 'dark:bg-emerald-900',
        darkText: 'dark:text-emerald-400',
    },
    violet: {
        bg: 'bg-violet-100',
        text: 'text-violet-600',
        darkBg: 'dark:bg-violet-900',
        darkText: 'dark:text-violet-400',
    },
    amber: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        darkBg: 'dark:bg-amber-900',
        darkText: 'dark:text-amber-400',
    },
};

export default function DriverPage() {
    const handleDownload = () => {
        window.open(GOOGLE_DRIVE_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading title="Download Driver" description="Unduh driver perangkat yang diperlukan untuk operasional" />

                {/* Main Download Card */}
                <Card className="border-2 border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                                <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Google Drive - Folder Driver</CardTitle>
                                <CardDescription>
                                    Semua file driver tersedia di Google Drive. Klik tombol di bawah untuk mengakses folder driver.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                <div className="flex items-start gap-2">
                                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        Anda akan diarahkan ke Google Drive untuk mengunduh driver yang diperlukan. Pastikan Anda memiliki akses
                                        internet yang stabil.
                                    </span>
                                </div>
                            </div>

                            <Button onClick={handleDownload} size="lg" className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Download Driver
                                <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {driverCategories.map((category) => {
                        const colors = colorMap[category.color];
                        return (
                            <Card
                                key={category.title}
                                className="cursor-pointer transition-all hover:shadow-md"
                                onClick={handleDownload}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.darkBg}`}
                                        >
                                            <category.icon className={`h-6 w-6 ${colors.text} ${colors.darkText}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{category.title}</h3>
                                            <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Petunjuk Instalasi</CardTitle>
                        <CardDescription>Panduan umum cara menginstall driver</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-inside list-decimal space-y-3 text-sm text-muted-foreground">
                            <li>
                                Klik tombol <strong className="text-foreground">"Download Driver"</strong> untuk membuka folder Google Drive.
                            </li>
                            <li>Pilih driver yang sesuai dengan perangkat Anda.</li>
                            <li>Unduh file driver ke komputer Anda.</li>
                            <li>Ekstrak file jika dalam format ZIP/RAR.</li>
                            <li>
                                Jalankan file <strong className="text-foreground">setup.exe</strong> atau{' '}
                                <strong className="text-foreground">install.exe</strong> sebagai Administrator.
                            </li>
                            <li>Ikuti petunjuk instalasi yang muncul di layar.</li>
                            <li>Restart komputer setelah instalasi selesai.</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
