import { Input } from '@/components/ui/input';
import { LoaderCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from './modal-search-fast';

interface RakInfo {
    nama_rak: string;
    kode_rak: string;
    baris: string;
}

interface SuggestionItem {
    id: number;
    serial_number: string;
    merek: string;
    model: string;
}

interface BarangDetail {
    id: number;
    nama_barang: string;
    serial_number: string;
    merek: string;
    model: string;
    asal: string;
    kondisi: string;
    status: string;
    lokasi: string;
    rak: RakInfo;
}

export default function FastSearch() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<BarangDetail | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const keyword = query.trim();
        const controller = new AbortController();

        if (!keyword) {
            setSuggestions([]);
            setIsLoading(false);
            return () => controller.abort();
        }

        const timeout = window.setTimeout(async () => {
            setIsLoading(true);

            try {
                const response = await fetch(route('dashboard.fast-search', { q: keyword }), {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) throw new Error();
                const result = await response.json();
                setSuggestions(result.data ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setSuggestions([]);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [query]);

    const handleSelect = async (id: number) => {
        setLoadingDetail(true);
        setSelectedBarang(null);
        setShowModal(true);
        setIsFocused(false);

        try {
            const response = await fetch(route('dashboard.barang-detail', id), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error();

            setSelectedBarang(await response.json());
        } catch {
            setSelectedBarang(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <div className="relative w-full">
            <Input
                type="search"
                role="combobox"
                aria-label="Cari barang"
                aria-expanded={isFocused && query.trim().length > 0}
                aria-controls="fast-search-results"
                autoComplete="off"
                className="h-11 bg-background pr-10"
                placeholder="Serial number, merek, atau model..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
            />
            {isLoading ? (
                <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
            ) : (
                <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            )}

            {isFocused && query.trim().length > 0 && (
                <div
                    id="fast-search-results"
                    role="listbox"
                    className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
                >
                    {isLoading && suggestions.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-5 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Mencari barang...
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="option"
                                aria-selected="false"
                                className="block w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    void handleSelect(item.id);
                                }}
                            >
                                <span className="block text-sm font-medium text-foreground">{item.serial_number}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                    {item.merek} {item.model}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-5 text-center text-sm text-muted-foreground">Barang tidak ditemukan.</div>
                    )}
                </div>
            )}

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    {loadingDetail ? (
                        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-5 animate-spin" />
                            Memuat data...
                        </div>
                    ) : selectedBarang ? (
                        <div className="space-y-5">
                            <div className="pr-8">
                                <p className="text-xs font-semibold tracking-wide text-primary uppercase">Detail Barang</p>
                                <h2 className="mt-1 text-xl font-semibold text-foreground">{selectedBarang.nama_barang}</h2>
                                <p className="text-sm text-muted-foreground">{selectedBarang.serial_number}</p>
                            </div>

                            <dl className="grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Status', selectedBarang.status],
                                    ['Kondisi', selectedBarang.kondisi],
                                    ['Merek', selectedBarang.merek],
                                    ['Model', selectedBarang.model],
                                    ['Lokasi', selectedBarang.lokasi],
                                    ['Asal', selectedBarang.asal],
                                    ['Rak', `${selectedBarang.rak.nama_rak} (${selectedBarang.rak.kode_rak})`],
                                    ['Baris', selectedBarang.rak.baris],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-lg bg-muted/60 px-3 py-2.5">
                                        <dt className="text-xs text-muted-foreground">{label}</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">Data barang tidak ditemukan.</div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
