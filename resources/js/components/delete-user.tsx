import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Trash2, TriangleAlert } from 'lucide-react';
import { type FormEventHandler, useRef, useState } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const closeDialog = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    const deleteUser: FormEventHandler = (event) => {
        event.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: closeDialog,
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <Card className="border-destructive/25">
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                            <TriangleAlert className="size-5" />
                        </span>
                        <div className="space-y-1">
                            <CardTitle>Hapus Akun</CardTitle>
                            <CardDescription>Penghapusan akun bersifat permanen dan tidak dapat dibatalkan.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            Seluruh data dan akses yang terhubung dengan akun ini akan dihapus secara permanen.
                        </p>
                        <Button type="button" variant="destructive" className="shrink-0" onClick={() => setOpen(true)}>
                            <Trash2 />
                            Hapus akun
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) setOpen(true);
                    else closeDialog();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus akun secara permanen?</DialogTitle>
                        <DialogDescription>
                            Masukkan password untuk mengonfirmasi. Seluruh data akun akan dihapus dan tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-5" onSubmit={deleteUser}>
                        <div className="space-y-2">
                            <Label htmlFor="delete-account-password">Password</Label>
                            <Input
                                id="delete-account-password"
                                type="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Masukkan password saat ini"
                                autoComplete="current-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" variant="destructive" disabled={processing || !data.password}>
                                {processing ? 'Menghapus...' : 'Hapus akun'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
