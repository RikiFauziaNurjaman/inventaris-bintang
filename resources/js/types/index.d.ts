import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string; // href tidak wajib kalau dia menu induk
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[]; // ✅ tambahkan ini
}

export interface MaintenanceNotificationItem {
    lokasi_id: number;
    lokasi_nama: string;
    total_printer: number;
    type: 'overdue' | 'due_soon';
    diff_in_days: number;
    jadwal_berikutnya: string;
    kunjungan_terakhir: string | null;
    title: string;
    message: string;
}

export interface MaintenanceNotificationSummary {
    unread_count: number;
    overdue_count: number;
    due_soon_count: number;
    items: MaintenanceNotificationItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    maintenanceNotifications?: MaintenanceNotificationSummary;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
