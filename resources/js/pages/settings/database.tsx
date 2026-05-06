import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Database, Download, HardDrive, Trash2, Upload } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Database',
        href: '/database',
    },
];

interface BackupFile {
    filename: string;
    size: string;
    size_bytes: number;
    date: string;
    timestamp: number;
}

interface DatabasePageProps {
    backups: BackupFile[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function DatabasePage() {
    const { backups, flash } = usePage<{ backups: BackupFile[]; flash: { success?: string; error?: string } }>().props;
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { post: importPost, processing: importProcessing } = useForm({});

    const handleBackup = () => {
        setIsBackingUp(true);
        router.post(
            route('database.backup'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsBackingUp(false),
            },
        );
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('sql_file', selectedFile);

        router.post(route('database.import'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSelectedFile(null);
                setImportDialogOpen(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDelete = (filename: string) => {
        router.delete(route('database.destroy', { filename }), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Management" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <Heading title="Manajemen Database" description="Backup dan restore database aplikasi" />

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            {flash.success}
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {flash.error}
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Backup Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>Backup Database</CardTitle>
                                    <CardDescription>Buat file backup database (.sql)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Backup akan mengekspor seluruh data database ke dalam file SQL yang bisa didownload.
                            </p>
                            <Button onClick={handleBackup} disabled={isBackingUp} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                {isBackingUp ? 'Sedang memproses...' : 'Backup Sekarang'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Import Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                                    <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <CardTitle>Import Database</CardTitle>
                                    <CardDescription>Restore database dari file backup (.sql)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>Import akan menimpa data yang ada di database. Pastikan Anda sudah membuat backup terlebih dahulu.</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".sql"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900 dark:file:text-blue-300"
                                />

                                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full" disabled={!selectedFile}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import Database
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Import Database</DialogTitle>
                                            <DialogDescription>
                                                Apakah Anda yakin ingin mengimport file <strong>{selectedFile?.name}</strong>?
                                                <br />
                                                <br />
                                                <span className="font-semibold text-red-600 dark:text-red-400">
                                                    ⚠️ Data yang ada di database saat ini bisa tertimpa. Pastikan Anda sudah membuat backup.
                                                </span>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button variant="outline">Batal</Button>
                                            </DialogClose>
                                            <Button variant="destructive" onClick={handleImport} disabled={importProcessing}>
                                                {importProcessing ? 'Sedang memproses...' : 'Ya, Import Sekarang'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Backup Files List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Backup</CardTitle>
                        <CardDescription>Daftar file backup yang tersedia di server</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {backups && backups.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama File</TableHead>
                                            <TableHead>Ukuran</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.filename}>
                                                <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                                                <TableCell>{backup.size}</TableCell>
                                                <TableCell>{backup.date}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                window.location.href = route('database.download', {
                                                                    filename: backup.filename,
                                                                });
                                                            }}
                                                        >
                                                            <Download className="mr-1 h-3 w-3" />
                                                            Download
                                                        </Button>

                                                        <Dialog
                                                            open={deleteDialogOpen && deleteTarget === backup.filename}
                                                            onOpenChange={(open) => {
                                                                setDeleteDialogOpen(open);
                                                                if (!open) setDeleteTarget(null);
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => setDeleteTarget(backup.filename)}
                                                                >
                                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                                    Hapus
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Hapus Backup</DialogTitle>
                                                                    <DialogDescription>
                                                                        Apakah Anda yakin ingin menghapus file backup{' '}
                                                                        <strong>{backup.filename}</strong>? Tindakan ini tidak bisa dibatalkan.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="gap-2">
                                                                    <DialogClose asChild>
                                                                        <Button variant="outline">Batal</Button>
                                                                    </DialogClose>
                                                                    <Button variant="destructive" onClick={() => handleDelete(backup.filename)}>
                                                                        Ya, Hapus
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Database className="mb-3 h-12 w-12 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">Belum ada file backup</p>
                                <p className="mt-1 text-xs text-muted-foreground/60">Klik tombol "Backup Sekarang" untuk membuat backup pertama</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
