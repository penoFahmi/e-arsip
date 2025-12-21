import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

// Import Komponen Pecahan
import DashboardGreeting from './components/dashboard-greeting';
import DashboardStats from './components/dashboard-stats';
import DashboardAgenda from './components/dashboard-agenda';
import DashboardRecent from './components/dashboard-recent';

interface DashboardProps extends PageProps {
    stats: {
        total_surat: number;
        surat_bulan_ini: number;
        belum_disposisi?: number;
        total_user?: number;
        disposisi_masuk?: number;
        disposisi_selesai?: number;
    };
    recents: any[];
    agendas: any[];
}

export default function Dashboard({ stats, recents, agendas }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user.role === 'super_admin' || auth.user.role === 'admin_bidang';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* 1. Banner Ucapan */}
                <DashboardGreeting
                    user={auth.user}
                    countDisposisi={stats.disposisi_masuk}
                />

                {/* 2. Grid Statistik */}
                <DashboardStats
                    stats={stats}
                    isSuperAdmin={isSuperAdmin}
                />

                {/* 3. Grid Agenda & Surat Terbaru */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Agenda Component (Takes 2 Columns) */}
                    <DashboardAgenda agendas={agendas} />

                    {/* Recent Mail Component (Takes 1 Column) */}
                    <DashboardRecent recents={recents} />
                </div>

            </div>
        </AppLayout>
    );
}
