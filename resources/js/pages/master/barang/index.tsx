import { BarcodeScannerDialog } from '@/components/barcode-scanner-dialog';
import { Column, DataTable } from '@/components/data-table';
import { MasterDataFormPanel } from '@/components/master-data-form-panel';
import { MasterDataPage } from '@/components/master-data-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PERMISSIONS } from '@/constants/permission';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { Camera, Download, Edit3, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type NamedItem = { id: number; nama: string };
type ModelOption = {
    id: number;
    nama: string;
    jenis_id: number;
    merek: NamedItem;
    kategori: NamedItem;
    jenis: NamedItem;
};
type Lokasi = NamedItem & { is_gudang: boolean };
type Rak = { id: number; nama_rak: string; kode_rak: string; lokasi_id: number };
type SubLokasi = { id: number; nama: string; lokasi_id: number };
type Barang = {
    id: number;
    serial_number: string;
    kondisi_awal: string;
    status: string;
    pic: string | null;
    catatan: string | null;
    model_barang: ModelOption;
    asal: NamedItem | null;
    lokasi: Lokasi | null;
    rak: Rak | null;
    sub_lokasi: SubLokasi | null;
};
type Filters = { search?: string; kategori?: string; lokasi?: string; status?: string; kondisi?: string };
type Props = {
    barangList: {
        data: Barang[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Filters;
    filterOptions: {
        kategoriList: string[];
        lokasiList: string[];
        statusList: string[];
        kondisiList: string[];
        rakList: Rak[];
        subLokasiList: SubLokasi[];
    };
};

const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const statusLabels: Record<string, string> = {
    baik: 'Baik',
    bagus: 'Baik',
    rusak: 'Rusak',
    diperbaiki: 'Dalam perbaikan',
    maintenance: 'Maintenance',
    dipinjamkan: 'Dipinjamkan',
    dijual: 'Dijual',
    menunggu: 'Menunggu',
    dimusnahkan: 'Dimusnahkan',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground',
                ['baik', 'bagus'].includes(status) && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                ['rusak', 'dimusnahkan'].includes(status) && 'bg-destructive/10 text-destructive',
                ['diperbaiki', 'maintenance', 'menunggu'].includes(status) && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                status === 'dipinjamkan' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                status === 'dijual' && 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
            )}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

export default function BarangIndex({ barangList, filters, filterOptions }: Props) {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const permissions = auth.permissions ?? [];
    const [editing, setEditing] = useState<Barang | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        kategori: filters.kategori ?? '',
        lokasi: filters.lokasi ?? '',
        status: filters.status ?? '',
        kondisi: filters.kondisi ?? '',
    });
    const form = useForm({
        rak_id: '',
        sub_lokasi_id: '',
        serial_number: '',
        kondisi_awal: 'baru',
        pic: '',
        catatan: '',
    });

    const availableRacks = useMemo(() => {
        const locationId = editing?.lokasi?.id;
        return filterOptions.rakList.filter((rack) => rack.lokasi_id === locationId);
    }, [editing, filterOptions.rakList]);
    const availableSubLocations = useMemo(() => {
        const locationId = editing?.lokasi?.id;
        return filterOptions.subLokasiList.filter((subLokasi) => subLokasi.lokasi_id === locationId);
    }, [editing, filterOptions.subLokasiList]);

    const visitWithFilters = (next: typeof activeFilters, search = filters.search ?? '') => {
        router.get(route('barang.index'), { ...next, search }, { preserveState: true, preserveScroll: true, replace: true });
    };
    const search = useDebouncedCallback((value: string) => visitWithFilters(activeFilters, value));

    const closeForm = () => {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setShowForm(false);
    };

    const openEdit = (item: Barang) => {
        form.setData({
            rak_id: item.rak ? String(item.rak.id) : '',
            sub_lokasi_id: item.sub_lokasi ? String(item.sub_lokasi.id) : '',
            serial_number: item.serial_number,
            kondisi_awal: item.kondisi_awal,
            pic: item.pic ?? '',
            catatan: item.catatan ?? '',
        });
        form.clearErrors();
        setEditing(item);
        setShowForm(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!editing) return;
        form.transform((data) => ({
            serial_number: data.serial_number,
            kondisi_awal: data.kondisi_awal,
            rak_id: data.rak_id || null,
            sub_lokasi_id: data.sub_lokasi_id || null,
            pic: data.pic || null,
            catatan: data.catatan || null,
        }));
        form.put(route('barang.update', editing.id), { preserveScroll: true, onSuccess: closeForm });
    };

    const columns: Column<Barang>[] = [
        {
            header: 'Serial Number',
            accessorKey: 'serial_number',
            cell: (item) => <span className="font-mono text-xs font-medium">{item.serial_number}</span>,
        },
        {
            header: 'Barang',
            accessorKey: 'model_barang',
            cell: (item) => (
                <div>
                    <p className="font-medium">
                        {item.model_barang?.merek?.nama} {item.model_barang?.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.model_barang?.kategori?.nama}</p>
                </div>
            ),
        },
        {
            header: 'Lokasi',
            accessorKey: 'lokasi',
            cell: (item) => (
                <div>
                    <p>{item.lokasi?.nama || '—'}</p>
                    <p className="text-xs text-muted-foreground">
                        {item.rak ? `${item.rak.nama_rak} · ${item.rak.kode_rak}` : item.sub_lokasi?.nama || 'Tanpa penempatan rinci'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Kondisi',
            accessorKey: 'kondisi_awal',
            cell: (item) => (item.kondisi_awal === 'baru' ? 'Baru' : 'Second'),
        },
        { header: 'Status', accessorKey: 'status', cell: (item) => <StatusBadge status={item.status} /> },
    ];

    const updateFilter = (key: keyof typeof activeFilters, value: string) => {
        const next = { ...activeFilters, [key]: value };
        setActiveFilters(next);
        visitWithFilters(next);
    };
    const resetFilters = () => {
        const reset = { kategori: '', lokasi: '', status: '', kondisi: '' };
        setActiveFilters(reset);
        visitWithFilters(reset);
    };
    const hasActiveFilters = Object.values(activeFilters).some(Boolean);

    return (
        <MasterDataPage
            title="Data Barang"
            description="Lihat unit inventaris dan koreksi metadata aman. Penambahan atau pembatalan dilakukan melalui Transaksi Barang Masuk."
        >
            {showForm && editing && (
                <MasterDataFormPanel title="Edit data barang" onClose={closeForm}>
                    <div className="mb-5 grid gap-3 rounded-lg border bg-muted/35 p-4 text-sm sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Model</p>
                            <p className="font-medium">
                                {editing.model_barang?.merek?.nama} {editing.model_barang?.nama}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Lokasi</p>
                            <p className="font-medium">{editing.lokasi?.nama || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="mt-1">
                                <StatusBadge status={editing.status} />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="serial-barang">Serial number</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="serial-barang"
                                    value={form.data.serial_number}
                                    onChange={(event) => form.setData('serial_number', event.target.value)}
                                    placeholder="Masukkan serial number"
                                    aria-invalid={Boolean(form.errors.serial_number)}
                                    required
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => setScannerOpen(true)} aria-label="Pindai serial">
                                    <Camera />
                                </Button>
                            </div>
                            {form.errors.serial_number && <p className="text-sm text-destructive">{form.errors.serial_number}</p>}
                            {!form.errors.serial_number && (
                                <p className="text-xs text-muted-foreground">
                                    Serial hanya dapat dikoreksi sebelum barang memiliki aktivitas transaksi atau audit Stock Opname.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kondisi-barang">Kondisi awal</Label>
                            <select
                                id="kondisi-barang"
                                value={form.data.kondisi_awal}
                                onChange={(event) => form.setData('kondisi_awal', event.target.value)}
                                className={selectClass}
                                aria-invalid={Boolean(form.errors.kondisi_awal)}
                                required
                            >
                                <option value="baru">Baru</option>
                                <option value="second">Second</option>
                            </select>
                            {form.errors.kondisi_awal && <p className="text-sm text-destructive">{form.errors.kondisi_awal}</p>}
                        </div>
                        {editing.lokasi?.is_gudang && (
                            <div className="space-y-2">
                                <Label htmlFor="rak-barang">Rak</Label>
                                <select
                                    id="rak-barang"
                                    value={form.data.rak_id}
                                    onChange={(event) => form.setData('rak_id', event.target.value)}
                                    className={selectClass}
                                    aria-invalid={Boolean(form.errors.rak_id)}
                                >
                                    <option value="">Tanpa rak</option>
                                    {availableRacks.map((rak) => (
                                        <option key={rak.id} value={rak.id}>
                                            {rak.nama_rak} · {rak.kode_rak}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.rak_id && <p className="text-sm text-destructive">{form.errors.rak_id}</p>}
                            </div>
                        )}
                        {!editing.lokasi?.is_gudang && (
                            <div className="space-y-2">
                                <Label htmlFor="sub-lokasi-barang">Sub-lokasi</Label>
                                <select
                                    id="sub-lokasi-barang"
                                    value={form.data.sub_lokasi_id}
                                    onChange={(event) => form.setData('sub_lokasi_id', event.target.value)}
                                    className={selectClass}
                                    aria-invalid={Boolean(form.errors.sub_lokasi_id)}
                                >
                                    <option value="">Tanpa sub-lokasi</option>
                                    {availableSubLocations.map((subLokasi) => (
                                        <option key={subLokasi.id} value={subLokasi.id}>
                                            {subLokasi.nama}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.sub_lokasi_id && <p className="text-sm text-destructive">{form.errors.sub_lokasi_id}</p>}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="pic-barang">PIC</Label>
                            <Input
                                id="pic-barang"
                                value={form.data.pic}
                                onChange={(event) => form.setData('pic', event.target.value)}
                                placeholder="Nama penanggung jawab"
                                aria-invalid={Boolean(form.errors.pic)}
                            />
                            {form.errors.pic && <p className="text-sm text-destructive">{form.errors.pic}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="catatan-barang">Catatan</Label>
                            <textarea
                                id="catatan-barang"
                                value={form.data.catatan}
                                onChange={(event) => form.setData('catatan', event.target.value)}
                                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                aria-invalid={Boolean(form.errors.catatan)}
                            />
                            {form.errors.catatan && <p className="text-sm text-destructive">{form.errors.catatan}</p>}
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Simpan perubahan'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <div className="flex justify-end">
                <Button asChild variant="outline">
                    <a href={route('barang.exportPdf', { ...activeFilters, search: filters.search ?? '' })} target="_blank" rel="noreferrer">
                        <Download />
                        Ekspor PDF
                    </a>
                </Button>
            </div>

            <DataTable
                data={barangList.data}
                columns={columns}
                links={barangList.links}
                paginationMeta={barangList}
                searchPlaceholder="Cari serial, merek, model, atau lokasi..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
                customFilters={
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">Filter data</p>
                                <p className="text-xs text-muted-foreground">Pilih satu atau beberapa filter untuk mempersempit hasil.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
                                <RotateCcw />
                                Reset
                            </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {(
                                [
                                    ['kategori', 'Kategori', 'Semua kategori', filterOptions.kategoriList],
                                    ['lokasi', 'Lokasi', 'Semua lokasi', filterOptions.lokasiList],
                                    ['status', 'Status', 'Semua status', filterOptions.statusList],
                                    ['kondisi', 'Kondisi', 'Semua kondisi', filterOptions.kondisiList],
                                ] as const
                            ).map(([key, fieldLabel, placeholder, options]) => (
                                <div key={key} className="space-y-1.5">
                                    <Label htmlFor={`filter-${key}`} className="text-xs text-muted-foreground">
                                        {fieldLabel}
                                    </Label>
                                    <select
                                        id={`filter-${key}`}
                                        value={activeFilters[key]}
                                        onChange={(event) => updateFilter(key, event.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">{placeholder}</option>
                                        {options.map((option) => (
                                            <option key={option} value={option}>
                                                {statusLabels[option] ?? (option === 'baru' ? 'Baru' : option === 'second' ? 'Second' : option)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                actions={
                    permissions.includes(PERMISSIONS.EDIT_BARANG_INVENTARIS)
                        ? (item) => (
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(item)}
                                  aria-label={`Edit ${item.serial_number}`}
                              >
                                  <Edit3 />
                              </Button>
                          )
                        : undefined
                }
            />

            <BarcodeScannerDialog
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onDetected={(serial) => {
                    form.setData('serial_number', serial);
                    return { message: `${serial} dimasukkan ke form.`, tone: 'success' };
                }}
                title="Pindai serial barang"
            />
        </MasterDataPage>
    );
}
