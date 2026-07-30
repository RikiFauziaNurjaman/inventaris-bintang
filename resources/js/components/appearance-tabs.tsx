import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { type HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const options: { value: Appearance; icon: LucideIcon; label: string; description: string }[] = [
        { value: 'light', icon: Sun, label: 'Terang', description: 'Latar cerah untuk penggunaan siang hari.' },
        { value: 'dark', icon: Moon, label: 'Gelap', description: 'Lebih nyaman digunakan di lingkungan redup.' },
        { value: 'system', icon: Monitor, label: 'Ikuti Sistem', description: 'Menyesuaikan tema perangkat secara otomatis.' },
    ];

    return (
        <div className={cn('grid gap-3 sm:grid-cols-3', className)} {...props}>
            {options.map(({ value, icon: Icon, label, description }) => {
                const active = appearance === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        aria-pressed={active}
                        className={cn(
                            'relative flex min-h-36 flex-col items-start rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            active
                                ? 'border-primary/40 bg-primary/5 shadow-sm'
                                : 'border-border bg-background hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted/40',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-10 items-center justify-center rounded-lg',
                                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                            )}
                        >
                            <Icon className="size-5" />
                        </span>
                        <span className="mt-4 font-semibold text-foreground">{label}</span>
                        <span className="mt-1 text-xs leading-5 text-muted-foreground">{description}</span>
                        {active && (
                            <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
