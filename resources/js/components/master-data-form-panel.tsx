import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    onClose: () => void;
}>;

export function MasterDataFormPanel({ title, onClose, children }: Props) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        panelRef.current?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')?.focus();
    }, []);

    return (
        <Card ref={panelRef} aria-labelledby={titleId} className="scroll-mt-20 gap-5 py-5 shadow-xs">
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle id={titleId} className="text-base">
                    {title}
                </CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Tutup form">
                    <X />
                </Button>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
