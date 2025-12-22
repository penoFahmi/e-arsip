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
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const dashboardMenu: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

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

    const adminMenu: NavItem[] = [
        {
            title: 'Manajemen User',
            href: '/users',
            icon: Users,
        },
        {
            title: 'Manajemen Bidang',
            href: '/bidang', 
            icon: Folder,
        },
        {
            title: 'Pengaturan Aplikasi',
            href: '#',
            icon: Settings,
            items: [
                {
                    title: 'Identitas Aplikasi',
                    href: '/settings/app',
                    icon: Monitor
                },
                {
                    title: 'Label Disposisi',
                    href: '/settings/disposisi',
                    icon: FileText
                }
            ]
        },
    ];

    let navItems: NavItem[] = [...dashboardMenu];

    navItems = [...navItems, ...suratMenu];

    if (user.role === 'super_admin') {
        navItems = [...navItems, ...adminMenu];
    }

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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
