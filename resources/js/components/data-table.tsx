import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Search, SearchX, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type Column<T> = {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    className?: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export type PaginationMeta = {
    from: number | null;
    to: number | null;
    total: number;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    links?: PaginationLink[];
    paginationMeta?: PaginationMeta;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    onCreate?: () => void;
    createLabel?: string;
    actions?: (item: T) => React.ReactNode;
    actionWidth?: string;
    initialSearch?: string;
    customFilters?: React.ReactNode;
};

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    links,
    paginationMeta,
    searchPlaceholder = 'Cari data...',
    onSearch,
    onCreate,
    createLabel = 'Tambah Data',
    actions,
    actionWidth = 'w-[100px]',
    initialSearch = '',
    customFilters,
}: DataTableProps<T>) {
    const [search, setSearch] = useState(initialSearch);
    const defaultSearch = useDebouncedCallback((value: string) => {
        router.get(window.location.pathname, { search: value }, { preserveState: true, preserveScroll: true, replace: true });
    });

    useEffect(() => setSearch(initialSearch), [initialSearch]);

    const handleSearch = (value: string) => {
        setSearch(value);
        (onSearch ?? defaultSearch)(value);
    };

    const clearSearch = () => handleSearch('');
    const rowStart = paginationMeta?.from ?? 1;

    return (
        <section className="space-y-4" aria-label="Tabel data">
            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(event) => handleSearch(event.target.value)}
                            className="pr-9 pl-9"
                            aria-label={searchPlaceholder}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                aria-label="Bersihkan pencarian"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {onCreate && (
                        <Button type="button" onClick={onCreate} className="shrink-0">
                            <Plus />
                            {createLabel}
                        </Button>
                    )}
                </div>

                {customFilters && <div className="rounded-xl border bg-muted/30 p-3">{customFilters}</div>}
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                <Table>
                    <TableHeader className="bg-muted/60">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-14 text-xs font-semibold tracking-wider uppercase">No</TableHead>
                            {columns.map((column, index) => (
                                <TableHead key={index} className={cn('text-xs font-semibold tracking-wider uppercase', column.className)}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {actions && (
                                <TableHead className={cn('pr-5 text-right text-xs font-semibold tracking-wider uppercase', actionWidth)}>
                                    Aksi
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length ? (
                            data.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-muted-foreground">{rowStart + index}</TableCell>
                                    {columns.map((column, columnIndex) => (
                                        <TableCell key={columnIndex} className="text-foreground">
                                            {column.cell
                                                ? column.cell(item, index)
                                                : column.accessorKey
                                                  ? (item[column.accessorKey] as React.ReactNode)
                                                  : null}
                                        </TableCell>
                                    ))}
                                    {actions && <TableCell className="pr-5 text-right">{actions(item)}</TableCell>}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 2 : 1)} className="h-44 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <SearchX className="size-8 stroke-1" />
                                        <p className="text-sm font-medium text-foreground">
                                            {search ? 'Data yang dicari tidak ditemukan' : 'Belum ada data'}
                                        </p>
                                        {search && (
                                            <Button type="button" variant="link" size="sm" onClick={clearSearch}>
                                                Bersihkan pencarian
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {paginationMeta ? (
                    <p className="text-xs text-muted-foreground">
                        Menampilkan {paginationMeta.from ?? 0}–{paginationMeta.to ?? 0} dari {paginationMeta.total} data
                    </p>
                ) : (
                    <span />
                )}

                {links && links.length > 3 && (
                    <nav className="flex items-center justify-end gap-1" aria-label="Paginasi">
                        {links.map((link, index) => {
                            const isPrevious = index === 0;
                            const isNext = index === links.length - 1;
                            const label = link.label.replace(/&laquo;|&raquo;|Previous|Next/gi, '').trim();
                            const content = isPrevious ? (
                                <>
                                    <ChevronLeft />
                                    <span className="sr-only">Sebelumnya</span>
                                </>
                            ) : isNext ? (
                                <>
                                    <ChevronRight />
                                    <span className="sr-only">Berikutnya</span>
                                </>
                            ) : (
                                label
                            );

                            return link.url ? (
                                <Button key={index} asChild variant={link.active ? 'default' : 'outline'} size="icon">
                                    <Link href={link.url} preserveState preserveScroll aria-current={link.active ? 'page' : undefined}>
                                        {content}
                                    </Link>
                                </Button>
                            ) : (
                                <Button key={index} variant="outline" size="icon" disabled>
                                    {content}
                                </Button>
                            );
                        })}
                    </nav>
                )}
            </div>
        </section>
    );
}
