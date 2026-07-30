import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LockKeyhole, Palette, UserRound, type LucideIcon } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const navigation: { title: string; description: string; href: string; icon: LucideIcon }[] = [
    {
        title: 'Profil',
        description: 'Identitas dan email',
        href: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Password',
        description: 'Keamanan akun',
        href: '/settings/password',
        icon: LockKeyhole,
    },
    {
        title: 'Tampilan',
        description: 'Tema antarmuka',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const currentPath = usePage().url.split('?')[0];

    return (
        <main className="bg-background px-4 py-6 sm:px-6">
            <div className="w-full max-w-6xl space-y-6">
                <header className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Pengaturan Akun</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Pengaturan</h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Kelola informasi akun, keamanan, dan preferensi tampilan aplikasi.
                    </p>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border bg-card p-2 shadow-xs lg:sticky lg:top-6">
                        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Navigasi pengaturan">
                            {navigation.map(({ title, description, href, icon: Icon }) => {
                                const active = currentPath === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        prefetch
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex min-w-44 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-w-0',
                                            active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold">{title}</span>
                                            <span className="block truncate text-xs opacity-75">{description}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="min-w-0 space-y-6">{children}</section>
                </div>
            </div>
        </main>
    );
}
