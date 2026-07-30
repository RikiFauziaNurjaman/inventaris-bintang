import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Check, LockKeyhole, Save, ShieldCheck } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan', href: '/settings/profile' },
    { title: 'Password', href: '/settings/password' },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Password" />
            <SettingsLayout>
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                <LockKeyhole className="size-5" />
                            </span>
                            <div className="space-y-1">
                                <CardTitle>Ubah Password</CardTitle>
                                <CardDescription>Gunakan password yang kuat dan tidak digunakan pada layanan lain.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <form onSubmit={updatePassword}>
                        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Password Saat Ini</Label>
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(event) => setData('current_password', event.target.value)}
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Masukkan password saat ini"
                                    />
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(event) => setData('password', event.target.value)}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Masukkan password baru"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(event) => setData('password_confirmation', event.target.value)}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Ulangi password baru"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <aside className="h-fit rounded-xl border bg-muted/30 p-4">
                                <ShieldCheck className="size-5 text-primary" />
                                <h3 className="mt-3 text-sm font-semibold text-foreground">Password yang disarankan</h3>
                                <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                                    <li>Minimal 8 karakter.</li>
                                    <li>Gunakan kombinasi huruf, angka, dan simbol.</li>
                                    <li>Hindari nama atau informasi yang mudah ditebak.</li>
                                </ul>
                            </aside>
                        </CardContent>

                        <CardFooter className="mt-6 flex-wrap justify-between gap-3 border-t bg-muted/30 pt-5">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    <Check className="size-4" />
                                    Password berhasil diperbarui
                                </p>
                            </Transition>
                            <Button disabled={processing} className="ml-auto">
                                <Save />
                                {processing ? 'Menyimpan...' : 'Simpan password'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
