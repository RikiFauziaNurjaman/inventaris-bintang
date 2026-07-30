import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description: string;
    onConfirm: () => void;
    processing?: boolean;
    confirmLabel?: string;
    confirmVariant?: 'default' | 'destructive';
};

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title = 'Hapus data?',
    description,
    onConfirm,
    processing = false,
    confirmLabel = 'Hapus',
    confirmVariant = 'destructive',
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={processing}>
                        {processing ? 'Memproses...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
