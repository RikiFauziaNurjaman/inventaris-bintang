import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import debounce from 'lodash.debounce';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export type Column<T> = {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    className?: string; // Standardize column width or alignment
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    links?: PaginationLink[];
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    onCreate?: () => void;
    createLabel?: string;
    actions?: (item: T) => React.ReactNode; // Optional custom actions column
    actionWidth?: string; // Optional width for action column
    initialSearch?: string;
    customFilters?: React.ReactNode;
};

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    links,
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

    const handleSearch = (value: string) => {
        setSearch(value);
        if (onSearch) {
            onSearch(value);
        } else {
            // Default Inertia search behavior if onSearch is not provided
            const handleDebouncedSearch = debounce(() => {
                router.get(
                    window.location.pathname,
                    { search: value },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }, 400);
            handleDebouncedSearch();
        }
    };

    // Cleanup debounce on unmount (optional but good practice)
    useEffect(() => {
        return () => {
            // clean up
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Header / Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 sm:max-w-[300px]">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-9 w-full rounded-md border border-gray-200 bg-white pr-4 pl-9 text-sm outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-gray-400"
                        />
                    </div>
                    {customFilters}
                </div>

                {onCreate && (
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-zinc-950"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {createLabel}
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-zinc-800/50">
                        <TableRow className="hover:bg-slate-100 dark:hover:bg-zinc-800/50">
                            {/* Auto Numbering Header */}
                            <TableHead className="w-[50px] text-xs font-semibold tracking-wider text-slate-500 uppercase">No</TableHead>

                            {columns.map((col, index) => (
                                <TableHead key={index} className={cn('text-xs font-semibold tracking-wider text-slate-500 uppercase', col.className)}>
                                    {col.header}
                                </TableHead>
                            ))}

                            {actions && (
                                <TableHead
                                    className={cn('pr-6 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase', actionWidth)}
                                >
                                    Aksi
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <TableRow key={item.id} className="transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{index + 1}</TableCell>

                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} className="text-slate-700 dark:text-slate-300">
                                            {col.cell ? col.cell(item, index) : col.accessorKey ? (item[col.accessorKey] as React.ReactNode) : null}
                                        </TableCell>
                                    ))}

                                    {actions && <TableCell className="pr-6 text-right">{actions(item)}</TableCell>}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actions ? 2 : 1)}
                                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                                >
                                    Tidak ada data ditemukan
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {links &&
                links.length > 3 && ( // Only show if we have actual pages (Laravel usually gives prev, 1, next)
                    <div className="flex justify-end pt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            {links.map((link, i) => {
                                // Clean up label (remove &laquo; etc)
                                const label = link.label.replace('&laquo; Previous', 'Prev').replace('Next &raquo;', 'Next');

                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={cn(
                                            'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md px-3 text-xs font-medium transition-colors',
                                            link.active
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : !link.url
                                                  ? 'pointer-events-none text-gray-300 dark:text-gray-600'
                                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-200',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: label }} // Keep arrow entities if we didn't replace them or want them
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
        </div>
    );
}
