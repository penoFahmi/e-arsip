import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

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
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role: 'super-admin' | 'admin_bidang' | 'pimpinan' | 'staf';
    id_bidang?: number | null;
    bidang?: Bidang | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Bidang {
    id: number;
    nama_bidang: string;
    kode: string;
}

export interface AppConfig {
    name: string;
    desc: string;
    logo: string;
    instansi: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    app_config: AppConfig; // <--- Tambahan Baru
    flash: {
        success: string | null;
        error: string | null;
    };
};

