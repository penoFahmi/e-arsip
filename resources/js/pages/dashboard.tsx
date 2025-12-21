import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText, Inbox, Users, AlertCircle,
    CheckCircle, Clock, ArrowRight, Calendar as CalendarIcon, MapPin,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

    // --- STATE KALENDER SEDERHANA ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Helper: Mendapatkan hari-hari dalam bulan ini
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper: Mendapatkan hari pertama bulan ini (0 = Minggu, 1 = Senin, dst)
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Navigasi Bulan
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Generate Array Kalender
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Array kosong untuk padding hari sebelum tanggal 1
    const blanks = Array(firstDay).fill(null);
    // Array tanggal 1 sd 30/31
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Cek apakah ada agenda di tanggal tertentu
    const hasAgenda = (day: number) => {
        // [FIX] Gunakan format manual string YYYY-MM-DD agar tidak kena timezone offset
        const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return agendas.some(a => a.tgl_mulai === checkDate);
    };

    // Filter Agenda berdasarkan tanggal yang dipilih (Visual saja)
    const displayAgendas = selectedDate
        ? agendas.filter(a => a.tgl_mulai === selectedDate)
        : agendas;

    // Helper untuk format tanggal bahasa Indonesia yang aman
    const formatDateIndo = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Greeting Section */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-2">Halo, {auth.user.name}! 👋</h1>
                        <p className="text-slate-300 text-sm max-w-2xl">
                            {stats.disposisi_masuk && stats.disposisi_masuk > 0
                                ? `Anda memiliki ${stats.disposisi_masuk} tugas disposisi baru. Cek kalender di bawah untuk jadwal kegiatan.`
                                : "Tidak ada tugas mendesak. Sistem berjalan lancar."}
                        </p>
                    </div>
                    {/* Hiasan Background */}
                    <CalendarIcon className="absolute right-4 bottom-[-20px] h-32 w-32 text-white/5 rotate-12" />
                </div>

                {/* --- STATISTIK --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm">
                         <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Surat</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.total_surat}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Inbox className="h-5 w-5" /></div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm">
                         <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Bulan Ini</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.surat_bulan_ini}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><FileText className="h-5 w-5" /></div>
                        </CardContent>
                    </Card>

                    {/* Kondisional Card */}
                     <Card className={`shadow-sm ${isSuperAdmin ? '' : 'ring-1 ring-orange-100'}`}>
                         <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {isSuperAdmin ? 'Belum Disposisi' : 'Tugas Baru'}
                                </p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {isSuperAdmin ? stats.belum_disposisi : stats.disposisi_masuk}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-full ${isSuperAdmin ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                {isSuperAdmin ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="shadow-sm">
                         <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pegawai Aktif</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.total_user || 0}</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-full"><Users className="h-5 w-5" /></div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- GRID UTAMA: AGENDA & SURAT --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* KOLOM KIRI: AGENDA (Span 2) */}
                    <Card className="xl:col-span-2 shadow-sm border-l-4 border-l-blue-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                                Agenda & Kalender Kegiatan
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row h-full">

                                {/* 1. KALENDER WIDGET (Kiri/Atas) */}
                                <div className="p-4 md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r bg-slate-50/50">
                                    {/* Header Bulan */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-700">
                                            {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <div className="flex gap-1">
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                                        </div>
                                    </div>

                                    {/* Grid Kalender */}
                                    <div className="grid grid-cols-7 text-center text-xs mb-2 text-gray-400 font-medium">
                                        <div>M</div><div>S</div><div>S</div><div>R</div><div>K</div><div>J</div><div>S</div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-sm">
                                        {/* Padding Hari Kosong */}
                                        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-8"></div>)}

                                        {/* Tanggal */}
                                        {days.map(day => {
                                            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                            // [FIX] Generate dateStr manual YYYY-MM-DD
                                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const hasEvent = hasAgenda(day);
                                            const isSelected = selectedDate === dateStr;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                                    className={`
                                                        h-9 w-9 rounded-full flex items-center justify-center relative transition-all
                                                        ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-gray-700'}
                                                        ${isToday && !isSelected ? 'border border-blue-600 font-bold text-blue-700' : ''}
                                                    `}
                                                >
                                                    {day}
                                                    {/* Titik Indikator Agenda */}
                                                    {hasEvent && (
                                                        <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                            <span>Menandakan ada kegiatan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. LIST AGENDA (Kanan/Bawah) */}
                                <div className="flex-1 p-4 md:p-6 bg-white min-h-[300px]">
                                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        {selectedDate
                                            ? `Jadwal: ${formatDateIndo(selectedDate)}` // [FIX] Tampilkan tanggal terpilih dengan format benar
                                            : "Agenda Terdekat"
                                        }
                                        {selectedDate && (
                                            <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 ml-auto" onClick={() => setSelectedDate(null)}>
                                                Reset
                                            </Button>
                                        )}
                                    </h4>

                                    <div className="space-y-4">
                                        {displayAgendas.length > 0 ? (
                                            displayAgendas.map((agenda: any) => (
                                                <div key={agenda.id} className="flex gap-4 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                                                    {/* Kotak Tanggal */}
                                                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                                        <span className="text-[10px] font-bold uppercase">
                                                            {new Date(agenda.tgl_mulai).toLocaleString('id-ID', { month: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-bold leading-none">
                                                            {new Date(agenda.tgl_mulai).getDate()}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-semibold text-gray-900 truncate" title={agenda.judul_agenda}>
                                                            {agenda.judul_agenda}
                                                        </h5>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {agenda.jam_mulai?.substring(0, 5)} WIB
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {agenda.lokasi}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">PJ: {agenda.penanggung_jawab?.name}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50/50 rounded-lg border-2 border-dashed">
                                                <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-sm">Tidak ada agenda pada tanggal ini.</p>
                                                <p className="text-xs text-gray-400">Pastikan filter tanggal benar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KOLOM KANAN: SURAT TERBARU (SAMA) */}
                    <Card className="shadow-sm h-fit">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                             <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-600" /> Surat Masuk Terbaru
                            </CardTitle>
                            <Link href="/surat-masuk" className="text-xs text-blue-600 hover:underline">
                                Lihat Semua
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                             <div className="divide-y">
                                {recents.length > 0 ? recents.map((surat: any) => (
                                    <Link key={surat.id} href={`/surat-masuk/${surat.id}`} className="block p-4 hover:bg-slate-50 transition">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                                surat.status_surat === 'baru'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                                {surat.status_surat === 'baru' ? 'Baru' : 'Didisposisi'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(surat.tgl_terima).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                            </span>
                                        </div>
                                        <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                                            {surat.perihal}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{surat.pengirim}</p>
                                    </Link>
                                )) : (
                                    <div className="p-6 text-center text-gray-400 text-xs">Belum ada surat.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
