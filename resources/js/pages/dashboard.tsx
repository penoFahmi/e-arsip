import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText, Inbox, Users, AlertCircle,
    CheckCircle, Clock, ArrowRight
} from 'lucide-react';

// Interface untuk Props dari Controller
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
}

export default function Dashboard({ stats, recents }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user.role === 'super_admin' || auth.user.role === 'admin_bidang';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard'
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">

                {/* Greeting Section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Halo, {auth.user.name}! 👋</h1>
                    <p className="text-gray-300 text-sm">
                        Selamat datang di Sistem E-Arsip.
                        {isSuperAdmin
                            ? " Pantau terus surat masuk dan disposisi hari ini."
                            : " Cek disposisi masuk untuk melihat tugas Anda."}
                    </p>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Card 1: Total Surat (Semua User) */}
                    <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Surat</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_surat}</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <Inbox className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Card 2: Surat Bulan Ini (Semua User) */}
                    <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Bulan Ini</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.surat_bulan_ini}</h3>
                        </div>
                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>

                    {/* KONDISIONAL ADMIN */}
                    {isSuperAdmin ? (
                        <>
                            <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Belum Disposisi</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.belum_disposisi}</h3>
                                </div>
                                <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Pegawai</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_user}</h3>
                                </div>
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </>
                    ) : (
                        // KONDISIONAL STAF / PIMPINAN
                        <>
                            <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Tugas Baru</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.disposisi_masuk}</h3>
                                </div>
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-sidebar-border/70 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Tugas Selesai</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.disposisi_selesai}</h3>
                                </div>
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-sidebar-border/70 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Surat Masuk Terbaru</h3>
                        <Link href="/surat-masuk" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            Lihat Semua <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="divide-y">
                        {recents.length > 0 ? recents.map((surat: any) => (
                            <div key={surat.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{surat.perihal}</p>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                        <span>{surat.no_surat}</span>
                                        <span>•</span>
                                        <span>{surat.pengirim}</span>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded capitalize ${
                                    surat.status_surat === 'baru' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {surat.status_surat.replace('_', ' ')}
                                </span>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-gray-500 text-sm">Belum ada data surat.</div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
