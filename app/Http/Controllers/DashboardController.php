<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\Disposisi;
use App\Models\User;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;


class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Statistik Umum
        $stats = [
            'total_surat' => SuratMasuk::count(),
            'surat_bulan_ini' => SuratMasuk::whereMonth('tgl_terima', now()->month)
                ->whereYear('tgl_terima', now()->year)
                ->count(),
        ];

        // 2. Statistik Khusus Role
        if ($user->role === 'super_admin' || $user->role === 'level_1') {
            // Admin/Kaban perlu tahu surat belum didisposisi
            $stats['belum_disposisi'] = SuratMasuk::where('status_surat', 'baru')->count();
            $stats['total_user'] = User::count();
        } else {
            // Pegawai biasa perlu tahu tugas (disposisi) yang masuk ke dia
            $stats['disposisi_masuk'] = Disposisi::where('ke_user_id', $user->id)
                ->where('status_disposisi', '!=', 'selesai')
                ->count();
            $stats['disposisi_selesai'] = Disposisi::where('ke_user_id', $user->id)
                ->where('status_disposisi', 'selesai')
                ->count();
        }

        // 3. [BARU] Ambil Agenda Kegiatan Terdekat (Hari ini & Kedepan)
        // Kita ambil 5 agenda terdekat yang belum lewat
        $agendas = Agenda::with(['surat', 'penanggungJawab'])
            ->whereDate('tgl_mulai', '>=', Carbon::today())
            ->orderBy('tgl_mulai', 'asc')
            ->orderBy('jam_mulai', 'asc')
            ->limit(5)
            ->get();

        // 4. Data Surat Terbaru (Tetap ada)
        $recentSurats = SuratMasuk::latest('tgl_terima')->take(5)->get();

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'recents' => $recentSurats,
            'agendas' => $agendas,
        ]);
    }
}
