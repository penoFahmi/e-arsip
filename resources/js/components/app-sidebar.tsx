import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    Settings,
    Send,
    Monitor,
    FileText,
    FileInput,
    FileOutput,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    // 1. Ambil data User yang sedang login
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // 2. Definisikan Menu Dasar (Semua orang bisa lihat)
    const dashboardMenu: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // 3. Menu Surat (Untuk Staff, Admin Bidang, Pimpinan)
    const suratMenu: NavItem[] = [
        {
            title: 'Surat Masuk',
            href: '/surat-masuk',
            icon: FileInput,
        },
        {
            title: 'Disposisi',
            href: '/disposisi',
            icon: Send,
        },
        {
            title: 'Surat Keluar',
            href: '/surat-keluar',
            icon: FileOutput,
        },
    ];

    // 4. Menu Khusus Administrator (Hanya Super Admin)
    const adminMenu: NavItem[] = [
        {
            title: 'Manajemen User',
            href: '/users', // Route ke CRUD User
            icon: Users,
        },
        {
            title: 'Manajemen Bidang',
            href: '/bidang', // Route ke CRUD Bidang
            icon: Folder,
        },
        {
            title: 'Pengaturan Aplikasi',
            href: '#', // Route ke Form Upload Logo (White-label)
            icon: Settings,
            items: [ // Submenu
                {
                    title: 'Identitas Aplikasi', // Ke file AppSettings kamu
                    href: '/settings/app',
                    icon: Monitor
                },
                {
                    title: 'Label Disposisi', // Ke file DisposisiSettings baru
                    href: '/settings/disposisi',
                    icon: FileText
                }
            ]
        },
    ];

    // 5. Gabungkan Menu Berdasarkan Role
    let navItems: NavItem[] = [...dashboardMenu];

    // Jika user BUKAN super admin, tampilkan menu surat (Opsional, tergantung alur)
    // Atau tampilkan ke semua. Mari tampilkan ke semua dulu.
    navItems = [...navItems, ...suratMenu];

    // Hanya Super Admin yang dapat menu Admin (User & Settings)
    // Pastikan user.role ada di database dan types
    if (user.role === 'super_admin') {
        navItems = [...navItems, ...adminMenu];
    }

    // Footer menu (Dokumentasi/Repo)
    const footerNavItems: NavItem[] = [
        {
            title: 'Dokumentasi',
            href: 'https://github.com/penoFahmi/e-arsip.git',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Render Menu Dinamis */}
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
