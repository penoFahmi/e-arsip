import { User } from '@/types';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Props {
    user: any; // Atau tipe User yang spesifik
    countDisposisi?: number;
}

export default function DashboardGreeting({ user, countDisposisi }: Props) {
    return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-2">Halo, {user.name}! 👋</h1>
                <p className="text-slate-300 text-sm max-w-2xl">
                    {countDisposisi && countDisposisi > 0
                        ? `Anda memiliki ${countDisposisi} tugas disposisi baru. Cek kalender di bawah untuk jadwal kegiatan.`
                        : "Tidak ada tugas mendesak. Sistem berjalan lancar."}
                </p>
            </div>
            {/* Hiasan Background */}
            <CalendarIcon className="absolute right-4 bottom-[-20px] h-32 w-32 text-white/5 rotate-12" />
        </div>
    );
}
