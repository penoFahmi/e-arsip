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
import { type NavItem, type SharedData } from '@/types';
import { usePage, Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FileInput,
    FileOutput,
    Send,
    Calendar,
    BookOpen,
    Users,
    Folder,
    Settings,
    Monitor,
    FileText,
    BookMarked,
    CalendarDays,
    MailCheck,
    MonitorCheck
} from 'lucide-react';
import AppLogo from './app-logo';
import { title } from 'process';

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
            title: 'Surat Keluar',
            href: '/surat-keluar',
            icon: FileOutput,
        },

    ];

    const disposisiMenu: NavItem[] = [
        {
            title: 'Disposisi',
            href: '#',
            icon: Send,
            items: [
                {
                    title: 'Disposisi Masuk',
                    href: '/disposisi',
                    icon: MailCheck
                },
                {
                    title: 'Riwayat Disposisi',
                    href: '/disposisi/outgoing',
                    icon: MonitorCheck
                }
            ]
        },
    ]

    const agendaLaporanMenu: NavItem[] = [
        {
            title: 'Agenda Kegiatan',
            href: '#',
            icon: Calendar,
            items: [
                {
                    title: 'Jadwal Kegiatan',
                    href: '/agenda',
                    icon: CalendarDays
                },
                {
                    title: 'Kalender',
                    href: '/agenda/kalender',
                    icon: Calendar
                }
            ]
        },
        {
            title: 'Laporan & Arsip',
            href: '#',
            icon: BookMarked,
            items: [
                {
                    title: 'Buku Agenda Masuk',
                    href: '/laporan/surat-masuk',
                    icon: BookOpen
                },
                {
                    title: 'Buku Agenda Keluar',
                    href: '/laporan/surat-keluar',
                    icon: BookOpen
                }
            ]
        }
    ];

    const adminMenu: NavItem[] = [
        {
            title: 'Manajemen Pegawai',
            href: '/users',
            icon: Users,
        },
        {
            title: 'Unit Kerja (Bidang)',
            href: '/bidang',
            icon: Folder,
        },
        {
            title: 'Pengaturan',
            href: '#',
            icon: Settings,
            items: [
                {
                    title: 'Identitas Aplikasi',
                    href: '/settings/app',
                    icon: Monitor
                },
                {
                    title: 'Format Disposisi',
                    href: '/settings/disposisi',
                    icon: FileText
                }
            ]
        },
    ];

    let navItems: NavItem[] = [...dashboardMenu, ...suratMenu, ...disposisiMenu, ...agendaLaporanMenu];

    if (user.role === 'super_admin' || user.role === 'level_1') {
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
