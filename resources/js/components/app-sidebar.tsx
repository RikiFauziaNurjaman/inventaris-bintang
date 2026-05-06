import SidebarSection from '@/components/sidebar-section';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { PERMISSIONS } from '@/constants/permission';
import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeftRight,
    Boxes,
    Building2,
    ClipboardList,
    Database,
    FileText,
    Layers,
    LayoutDashboard,
    LayoutGrid,
    Lock,
    MapPin,
    Package,
    Shapes,
    ShieldCheck,
    Tags,
    Undo2,
    UserCog,
    Users,
    HardDrive
} from 'lucide-react';
import AppLogo from './app-logo';

function filterMenuByPermissions(menuItems, userPermissions) {
    return menuItems.reduce((acc, item) => {
        // 1. Jika item memiliki children, filter children-nya terlebih dahulu
        if (item.children) {
            const visibleChildren = filterMenuByPermissions(item.children, userPermissions);
            // Jika ada setidaknya satu child yang terlihat, tampilkan parent menu
            if (visibleChildren.length > 0) {
                acc.push({ ...item, children: visibleChildren });
            }
        }
        // 2. Jika item tidak memiliki permission, anggap publik dan tampilkan
        else if (!item.permission) {
            acc.push(item);
        }
        // 3. Jika item punya permission, cek apakah user memilikinya
        else if (userPermissions.includes(item.permission)) {
            acc.push(item);
        }

        return acc;
    }, []);
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    const platformNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            permission: PERMISSIONS.VIEW_DASHBOARD,
        },
    ];

    const masterDataNavItems = [
        {
            title: 'Master Data',
            icon: Database,
            children: [
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
    ];

    const transaksiNavItems = [
        {
            title: 'Transaksi',
            href: '/transaksi',
            icon: LayoutGrid,
            permission: PERMISSIONS.VIEW_TRANSAKSI,
        },
    ];

    const monitoringNavItems = [
        {
            title: 'Monitoring',
            href: '/monitoring',
            icon: MapPin,
            permission: PERMISSIONS.VIEW_STOK_DASHBOARD,
        },
    ];

    const stokNavItems = [
        {
            title: 'Stok',
            icon: Package,
            children: [
                {
                    title: 'Stok',
                    href: '/stok',
                    icon: Boxes,
                    permission: PERMISSIONS.VIEW_STOK_DASHBOARD,
                },
                {
                    title: 'Stock Opname',
                    href: '/stock-opname',
                    icon: ClipboardList,
                    permission: PERMISSIONS.VIEW_STOCK_OPNAME,
                },
            ],
        },
    ];

    const laporanNavItems = [
        {
            title: 'Laporan',
            icon: FileText,
            children: [
                {
                    title: 'Dashboard Laporan',
                    href: route('laporan.index'),
                    icon: LayoutDashboard,
                    permission: PERMISSIONS.VIEW_DASHBOARD_LAPORAN,
                },
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
    const visibleMasterDataNavItems = filterMenuByPermissions(masterDataNavItems, userPermissions);
    const visibleTransaksiNavItems = filterMenuByPermissions(transaksiNavItems, userPermissions);
    const visibleMonitoringNavItems = filterMenuByPermissions(monitoringNavItems, userPermissions);
    const visibleStokNavItems = filterMenuByPermissions(stokNavItems, userPermissions);
    const visibleLaporanNavItems = filterMenuByPermissions(laporanNavItems, userPermissions);
    const visibleAksesNavItems = filterMenuByPermissions(aksesNavItems, userPermissions);
    const visibleSistemNavItems = filterMenuByPermissions(sistemNavItems, userPermissions);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
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

            <SidebarContent>
                {/* Group 1: Platform */}
                {visiblePlatformNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarSection items={visiblePlatformNavItems} />
                    </SidebarGroup>
                )}

                {/* Group 2: Master Data */}
                {visibleMasterDataNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Master Data</SidebarGroupLabel>
                        <SidebarSection items={visibleMasterDataNavItems} storageKey="sidebar-masterdata" />
                    </SidebarGroup>
                )}

                {visibleTransaksiNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Transaksi</SidebarGroupLabel>
                        <SidebarSection items={visibleTransaksiNavItems} />
                    </SidebarGroup>
                )}

                {visibleMonitoringNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
                        <SidebarSection items={visibleMonitoringNavItems} />
                    </SidebarGroup>
                )}

                {visibleStokNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Stok</SidebarGroupLabel>
                        <SidebarSection items={visibleStokNavItems} />
                    </SidebarGroup>
                )}

                {/* Group 3: Laporan */}
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

            <SidebarFooter>{/* User info moved to Header */}</SidebarFooter>
        </Sidebar>
    );
}
