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
import { dashboard } from '@/routes'; // Atau gunakan string manual jika route belum ada
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    Settings,
    Send,
    Inbox
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
    // Super Admin biasanya hanya memantau, tapi bisa juga akses jika perlu.
    // Di sini kita anggap semua butuh akses surat kecuali disembunyikan spesifik.
    const suratMenu: NavItem[] = [
        {
            title: 'Surat Masuk',
            href: '/surat-masuk',
            icon: Inbox,
        },
        {
            title: 'Disposisi',
            href: '/disposisi',
            icon: Send,
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
            title: 'Pengaturan Aplikasi',
            href: '/settings/app', // Route ke Form Upload Logo (White-label)
            icon: Settings,
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
            href: '#',
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
