import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type ReactNode } from 'react';

type ModalProps = {
    show: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal({ show, onClose, children }: ModalProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl">
                <DialogTitle className="sr-only">Detail barang</DialogTitle>
                {children}
            </DialogContent>
        </Dialog>
    );
}
