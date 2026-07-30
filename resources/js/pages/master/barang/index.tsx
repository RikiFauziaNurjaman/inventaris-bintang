import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
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
import { Edit3, RotateCcw, Trash2 } from 'lucide-react';
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
        modelList: ModelOption[];
        asalList: NamedItem[];
        gudangList: Lokasi[];
        rakList: Rak[];
        subLokasiList: SubLokasi[];
    };
};

const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

function localDate() {
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

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
    const [pendingDelete, setPendingDelete] = useState<Barang | null>(null);
    const [activeFilters, setActiveFilters] = useState({
        kategori: filters.kategori ?? '',
        lokasi: filters.lokasi ?? '',
        status: filters.status ?? '',
        kondisi: filters.kondisi ?? '',
    });
    const form = useForm({
        tanggal: localDate(),
        model_id: '',
        asal_id: '',
        lokasi_id: '',
        rak_id: '',
        sub_lokasi_id: '',
        serial_number: '',
        kondisi_awal: 'baru',
        pic: '',
        catatan: '',
    });

    const availableRacks = useMemo(() => {
        const locationId = editing ? editing.lokasi?.id : Number(form.data.lokasi_id);
        return filterOptions.rakList.filter((rack) => rack.lokasi_id === locationId);
    }, [editing, filterOptions.rakList, form.data.lokasi_id]);
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

    const openCreate = () => {
        form.setData({
            tanggal: localDate(),
            model_id: '',
            asal_id: '',
            lokasi_id: '',
            rak_id: '',
            sub_lokasi_id: '',
            serial_number: '',
            kondisi_awal: 'baru',
            pic: '',
            catatan: '',
        });
        form.clearErrors();
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (item: Barang) => {
        form.setData({
            tanggal: '',
            model_id: '',
            asal_id: '',
            lokasi_id: '',
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
        if (editing) {
            form.transform((data) => ({
                serial_number: data.serial_number,
                kondisi_awal: data.kondisi_awal,
                rak_id: data.rak_id || null,
                sub_lokasi_id: data.sub_lokasi_id || null,
                pic: data.pic || null,
                catatan: data.catatan || null,
            })).put(route('barang.update', editing.id), { preserveScroll: true, onSuccess: closeForm });
            return;
        }

        form.transform((data) => ({
            tanggal: data.tanggal,
            model_id: data.model_id,
            asal_id: data.asal_id || null,
            lokasi_id: data.lokasi_id,
            rak_id: data.rak_id || null,
            serial_number: data.serial_number,
            kondisi_awal: data.kondisi_awal,
            pic: data.pic || null,
            catatan: data.catatan || null,
        })).post(route('barang.store'), { preserveScroll: true, onSuccess: closeForm });
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

    return (
        <MasterDataPage title="Data Barang" description="Kelola setiap unit inventaris beserta serial number, kondisi, dan penempatannya.">
            {showForm && (
                <MasterDataFormPanel title={editing ? 'Edit data barang' : 'Tambah data barang'} onClose={closeForm}>
                    {editing && (
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
                    )}

                    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                        {!editing && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal-barang">Tanggal masuk</Label>
                                    <Input
                                        id="tanggal-barang"
                                        type="date"
                                        value={form.data.tanggal}
                                        onChange={(event) => form.setData('tanggal', event.target.value)}
                                        aria-invalid={Boolean(form.errors.tanggal)}
                                        required
                                    />
                                    {form.errors.tanggal && <p className="text-sm text-destructive">{form.errors.tanggal}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model-barang">Model barang</Label>
                                    <select
                                        id="model-barang"
                                        value={form.data.model_id}
                                        onChange={(event) => form.setData('model_id', event.target.value)}
                                        className={selectClass}
                                        aria-invalid={Boolean(form.errors.model_id)}
                                        required
                                    >
                                        <option value="">Pilih model</option>
                                        {filterOptions.modelList.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.merek?.nama} {model.nama} · {model.jenis?.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.model_id && <p className="text-sm text-destructive">{form.errors.model_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="asal-barang">Asal barang</Label>
                                    <select
                                        id="asal-barang"
                                        value={form.data.asal_id}
                                        onChange={(event) => form.setData('asal_id', event.target.value)}
                                        className={selectClass}
                                        aria-invalid={Boolean(form.errors.asal_id)}
                                    >
                                        <option value="">Tanpa asal</option>
                                        {filterOptions.asalList.map((asal) => (
                                            <option key={asal.id} value={asal.id}>
                                                {asal.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.asal_id && <p className="text-sm text-destructive">{form.errors.asal_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gudang-barang">Gudang</Label>
                                    <select
                                        id="gudang-barang"
                                        value={form.data.lokasi_id}
                                        onChange={(event) => form.setData((data) => ({ ...data, lokasi_id: event.target.value, rak_id: '' }))}
                                        className={selectClass}
                                        aria-invalid={Boolean(form.errors.lokasi_id)}
                                        required
                                    >
                                        <option value="">Pilih gudang</option>
                                        {filterOptions.gudangList.map((lokasi) => (
                                            <option key={lokasi.id} value={lokasi.id}>
                                                {lokasi.nama}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.lokasi_id && <p className="text-sm text-destructive">{form.errors.lokasi_id}</p>}
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="serial-barang">Serial number</Label>
                            <Input
                                id="serial-barang"
                                value={form.data.serial_number}
                                onChange={(event) => form.setData('serial_number', event.target.value)}
                                placeholder="Masukkan serial number"
                                aria-invalid={Boolean(form.errors.serial_number)}
                                required
                            />
                            {form.errors.serial_number && <p className="text-sm text-destructive">{form.errors.serial_number}</p>}
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
                        {(!editing || editing.lokasi?.is_gudang) && (
                            <div className="space-y-2">
                                <Label htmlFor="rak-barang">Rak</Label>
                                <select
                                    id="rak-barang"
                                    value={form.data.rak_id}
                                    onChange={(event) => form.setData('rak_id', event.target.value)}
                                    className={selectClass}
                                    disabled={!editing && !form.data.lokasi_id}
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
                        {editing && !editing.lokasi?.is_gudang && (
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
                                {form.processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan barang'}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeForm}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </MasterDataFormPanel>
            )}

            <DataTable
                data={barangList.data}
                columns={columns}
                links={barangList.links}
                paginationMeta={barangList}
                searchPlaceholder="Cari serial, merek, model, atau lokasi..."
                initialSearch={filters.search ?? ''}
                onSearch={search}
                customFilters={
                    <div className="flex flex-1 flex-wrap gap-2">
                        {(
                            [
                                ['kategori', 'Semua kategori', filterOptions.kategoriList],
                                ['lokasi', 'Semua lokasi', filterOptions.lokasiList],
                                ['status', 'Semua status', filterOptions.statusList],
                                ['kondisi', 'Semua kondisi', filterOptions.kondisiList],
                            ] as const
                        ).map(([key, label, options]) => (
                            <select
                                key={key}
                                value={activeFilters[key]}
                                onChange={(event) => updateFilter(key, event.target.value)}
                                className={`${selectClass} w-auto min-w-36`}
                                aria-label={label}
                            >
                                <option value="">{label}</option>
                                {options.map((option) => (
                                    <option key={option} value={option}>
                                        {statusLabels[option] ?? (option === 'baru' ? 'Baru' : option === 'second' ? 'Second' : option)}
                                    </option>
                                ))}
                            </select>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                const reset = { kategori: '', lokasi: '', status: '', kondisi: '' };
                                setActiveFilters(reset);
                                router.get(route('barang.index'), {}, { preserveScroll: true, replace: true });
                            }}
                            aria-label="Reset filter"
                        >
                            <RotateCcw />
                        </Button>
                    </div>
                }
                onCreate={permissions.includes(PERMISSIONS.CREATE_BARANG_INVENTARIS) ? openCreate : undefined}
                createLabel="Tambah barang"
                actions={(item) => (
                    <div className="flex justify-end gap-1">
                        {permissions.includes(PERMISSIONS.EDIT_BARANG_INVENTARIS) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(item)}
                                aria-label={`Edit ${item.serial_number}`}
                            >
                                <Edit3 />
                            </Button>
                        )}
                        {permissions.includes(PERMISSIONS.DELETE_BARANG_INVENTARIS) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(item)}
                                aria-label={`Hapus ${item.serial_number}`}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                )}
            />

            <ConfirmDeleteDialog
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title="Hapus data barang?"
                description={`Barang dengan serial “${pendingDelete?.serial_number ?? ''}” hanya akan dihapus bila belum memiliki aktivitas inventaris.`}
                processing={form.processing}
                onConfirm={() => {
                    if (!pendingDelete) return;
                    form.delete(route('barang.destroy', pendingDelete.id), { preserveScroll: true, onSuccess: () => setPendingDelete(null) });
                }}
            />
        </MasterDataPage>
    );
}
