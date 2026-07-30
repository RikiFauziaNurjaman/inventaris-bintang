import { BarcodeScannerDialog } from '@/components/barcode-scanner-dialog';
import { Camera, FileInput } from 'lucide-react';
import { useState } from 'react';

interface BulkSerialInputProps {
    onSerialsParsed: (serials: string[]) => void;
    existingSerials?: string[];
    allowedSerials?: string[];
}

export function BulkSerialInput({ onSerialsParsed, existingSerials = [], allowedSerials }: BulkSerialInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [parsedSerials, setParsedSerials] = useState<string[]>([]);
    const [duplicates, setDuplicates] = useState<string[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);

    const parseSerials = (text: string) => {
        // Split by newline, comma, semicolon, or tab
        const serials = text
            .split(/[\n,;\t]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        // Find duplicates with existing serials
        const dupes = serials.filter((s) => existingSerials.includes(s));
        setDuplicates(dupes);

        // Remove duplicates from parsed
        const unique = [...new Set(serials)].filter((s) => !existingSerials.includes(s));
        setParsedSerials(unique);
    };

    const handleConfirm = () => {
        if (parsedSerials.length > 0) {
            onSerialsParsed(parsedSerials);
            setBulkText('');
            setParsedSerials([]);
            setDuplicates([]);
            setIsOpen(false);
        }
    };

    const handleCancel = () => {
        setBulkText('');
        setParsedSerials([]);
        setDuplicates([]);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                    <FileInput className="size-4" />
                    Input massal
                </button>
                <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-blue-400 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                    <Camera className="size-4" />
                    Scan kamera
                </button>
                <BarcodeScannerDialog
                    open={scannerOpen}
                    onOpenChange={setScannerOpen}
                    onDetected={(serial) => {
                        if (existingSerials.some((item) => item.trim().toUpperCase() === serial.trim().toUpperCase())) {
                            return { message: `${serial} sudah ada pada form.`, tone: 'warning' };
                        }
                        if (
                            allowedSerials &&
                            !allowedSerials.some((item) => item.trim().toUpperCase() === serial.trim().toUpperCase())
                        ) {
                            return { message: `${serial} tidak tersedia untuk pilihan transaksi ini.`, tone: 'danger' };
                        }
                        onSerialsParsed([serial]);
                        return { message: `${serial} ditambahkan ke form.`, tone: 'success' };
                    }}
                    title="Pindai serial transaksi"
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-zinc-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Input Serial Number</h3>
                    <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Paste atau ketik serial number (pisahkan dengan Enter, koma, atau titik koma):
                    </p>
                    <textarea
                        value={bulkText}
                        onChange={(e) => {
                            setBulkText(e.target.value);
                            parseSerials(e.target.value);
                        }}
                        placeholder="Contoh:
SN001
SN002, SN003
SN004; SN005"
                        className="h-32 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                    />

                    {/* Preview */}
                    {parsedSerials.length > 0 && (
                        <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                            <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-400">
                                {parsedSerials.length} serial number akan ditambahkan:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {parsedSerials.slice(0, 10).map((sn, i) => (
                                    <span
                                        key={i}
                                        className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-800 dark:text-green-200"
                                    >
                                        {sn}
                                    </span>
                                ))}
                                {parsedSerials.length > 10 && (
                                    <span className="text-xs text-green-600 dark:text-green-400">+{parsedSerials.length - 10} lainnya</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Duplicates warning */}
                    {duplicates.length > 0 && (
                        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                            <p className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-400">
                                {duplicates.length} serial sudah ada (akan dilewati):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {duplicates.map((sn, i) => (
                                    <span
                                        key={i}
                                        className="inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 line-through dark:bg-yellow-800 dark:text-yellow-200"
                                    >
                                        {sn}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t px-4 py-3 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={parsedSerials.length === 0}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Tambahkan {parsedSerials.length > 0 && `(${parsedSerials.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
