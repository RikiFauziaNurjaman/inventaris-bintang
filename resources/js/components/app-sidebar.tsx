import SidebarSection from '@/components/sidebar-section';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { PERMISSIONS } from '@/constants/permission';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeftRight,
    Boxes,
    Building2,
    ClipboardList,
    FileText,
    HardDrive,
    Layers,
    LayoutGrid,
    Lock,
    MapPin,
    Package,
    PackagePlus,
    PackageSearch,
    Shapes,
    ShieldCheck,
    ShoppingCart,
    Tags,
    TriangleAlert,
    Truck,
    Undo2,
    UserCog,
    Users,
    Warehouse,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

type MenuItem = NavItem & {
    permission?: string;
    children?: MenuItem[];
};

function filterMenuByPermissions(menuItems: MenuItem[], userPermissions: string[]): MenuItem[] {
    return menuItems.reduce<MenuItem[]>((acc, item) => {
        if (item.children) {
            const visibleChildren = filterMenuByPermissions(item.children, userPermissions);
            if (visibleChildren.length > 0) {
                acc.push({ ...item, children: visibleChildren });
            }
        } else if (!item.permission) {
            acc.push(item);
        } else if (userPermissions.includes(item.permission)) {
            acc.push(item);
        }

        return acc;
    }, []);
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: { permissions?: string[] } }>().props;
    const userPermissions = auth.permissions || [];

    const platformNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            permission: PERMISSIONS.VIEW_DASHBOARD,
        },
    ];

    const operationalNavItems: MenuItem[] = [
        {
            title: 'Master Data',
            icon: Boxes,
            children: [
                { title: 'Data Barang', href: '/barang', icon: PackageSearch, permission: PERMISSIONS.VIEW_BARANG_INVENTARIS },
                { title: 'Kategori', href: '/kategori', icon: Layers, permission: PERMISSIONS.VIEW_KATEGORI },
                { title: 'Merek', href: '/merek', icon: Tags, permission: PERMISSIONS.VIEW_MEREK },
                { title: 'Model Barang', href: '/model', icon: Boxes, permission: PERMISSIONS.VIEW_MODEL },
                { title: 'Jenis Barang', href: '/jenis-barang', icon: Shapes, permission: PERMISSIONS.VIEW_JENIS },
                { title: 'Asal Barang', href: '/asal-barang', icon: Building2, permission: PERMISSIONS.VIEW_ASAL_BARANG },
                { title: 'Lokasi', href: '/lokasi', icon: MapPin, permission: PERMISSIONS.VIEW_LOKASI_DISTRIBUSI },
                { title: 'Sub-Lokasi', href: '/sub-lokasi', icon: MapPin, permission: PERMISSIONS.VIEW_LOKASI_DISTRIBUSI },
                { title: 'Rak Barang', href: '/rak-barang', icon: Archive, permission: PERMISSIONS.VIEW_RAK_BARANG },
            ],
        },
        {
            title: 'Transaksi',
            icon: ArrowLeftRight,
            children: [
                { title: 'Barang Masuk', href: '/barang-masuk', icon: PackagePlus, permission: PERMISSIONS.VIEW_BARANG_MASUK },
                { title: 'Barang Keluar', href: '/barang-keluar', icon: Truck, permission: PERMISSIONS.VIEW_BARANG_KELUAR },
                { title: 'Barang Kembali', href: '/barang-kembali', icon: Undo2, permission: PERMISSIONS.VIEW_BARANG_KEMBALI },
            ],
        },
        {
            title: 'Stok',
            icon: Package,
            children: [
                { title: 'Stok Gudang', href: '/stok-gudang', icon: Warehouse, permission: PERMISSIONS.VIEW_STOK_GUDANG },
                { title: 'Stok Distribusi', href: '/stok-distribusi', icon: Truck, permission: PERMISSIONS.VIEW_STOK_DISTRIBUSI },
                { title: 'Total Barang', href: '/total-stock', icon: Boxes, permission: PERMISSIONS.VIEW_STOK_TOTAL },
                { title: 'Stok Terjual', href: '/stok-terjual', icon: ShoppingCart, permission: PERMISSIONS.VIEW_STOK_TERJUAL },
                { title: 'Stok Rusak', href: '/stock-rusak', icon: TriangleAlert, permission: PERMISSIONS.VIEW_STOK_RUSAK },
                { title: 'Dalam Perbaikan', href: '/perbaikan', icon: Wrench, permission: PERMISSIONS.VIEW_STOK_DIPERBAIKI },
                { title: 'Stock Opname', href: '/stock-opname', icon: ClipboardList, permission: PERMISSIONS.VIEW_STOCK_OPNAME },
            ],
        },
        {
            title: 'Monitoring',
            href: '/monitoring',
            icon: MapPin,
            permission: PERMISSIONS.VIEW_STOK_DASHBOARD,
        },
    ];

    const laporanNavItems = [
        {
            title: 'Laporan',
            icon: FileText,
            children: [
                {
                    title: 'Laporan Barang Masuk',
                    href: route('laporan.masuk'),
                    icon: FileText,
                    permission: PERMISSIONS.VIEW_LAPORAN_BARANG_MASUK,
                },
                {
                    title: 'Laporan Barang Keluar',
                    href: route('laporan.keluar'),
                    icon: FileText,
                    permission: PERMISSIONS.VIEW_LAPORAN_BARANG_KELUAR,
                },
                {
                    title: 'Laporan Barang Kembali',
                    href: route('laporan.kembali'),
                    icon: Undo2,
                    permission: PERMISSIONS.VIEW_LAPORAN_BARANG_KEMBALI,
                },
                {
                    title: 'Laporan Mutasi Barang',
                    href: route('laporan.mutasi'),
                    icon: ArrowLeftRight,
                    permission: PERMISSIONS.VIEW_LAPORAN_MUTASI,
                },
            ],
        },
    ];
    const aksesNavItems = [
        {
            title: 'Manajemen Akses',
            icon: Lock,
            children: [
                { title: 'User', href: '/users', icon: Users },
                { title: 'Role', href: '/roles', icon: UserCog },
                { title: 'Permission', href: '/permissions', icon: ShieldCheck },
            ],
        },
    ];

    const sistemNavItems = [
        {
            title: 'Database',
            href: '/database',
            icon: HardDrive,
            permission: PERMISSIONS.BACKUP_DATABASE,
        },
    ];

    const visiblePlatformNavItems = filterMenuByPermissions(platformNavItems, userPermissions);
    const visibleOperationalNavItems = filterMenuByPermissions(operationalNavItems, userPermissions);
    const visibleLaporanNavItems = filterMenuByPermissions(laporanNavItems, userPermissions);
    const visibleAksesNavItems = filterMenuByPermissions(aksesNavItems, userPermissions);
    const visibleSistemNavItems = filterMenuByPermissions(sistemNavItems, userPermissions);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border/80 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1 py-3">
                {/* Group 1: Platform */}
                {visiblePlatformNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarSection items={visiblePlatformNavItems} />
                    </SidebarGroup>
                )}

                {visibleOperationalNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Operasional</SidebarGroupLabel>
                        <SidebarSection items={visibleOperationalNavItems} storageKey="sidebar-operasional" />
                    </SidebarGroup>
                )}

                {visibleLaporanNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Laporan</SidebarGroupLabel>
                        <SidebarSection items={visibleLaporanNavItems} storageKey="sidebar-laporan" />
                    </SidebarGroup>
                )}

                {visibleAksesNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Manajemen Akses</SidebarGroupLabel>
                        <SidebarSection items={visibleAksesNavItems} storageKey="sidebar-akses" />
                    </SidebarGroup>
                )}

                {visibleSistemNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Sistem</SidebarGroupLabel>
                        <SidebarSection items={visibleSistemNavItems} />
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
