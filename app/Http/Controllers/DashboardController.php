<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\Disposisi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Statistik Umum (Semua User bisa lihat jumlah, atau batasi sesuai role)
        $stats = [
            'total_surat' => SuratMasuk::count(),
            'surat_bulan_ini' => SuratMasuk::whereMonth('tgl_terima', now()->month)
                                ->whereYear('tgl_terima', now()->year)
                                ->count(),
        ];

        // 2. Statistik Khusus Role
        if ($user->role === 'super_admin' || $user->role === 'admin_bidang') {
            // Admin perlu tahu surat mana yang belum diproses
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

        // 3. Data Terbaru (5 Surat Terakhir)
        $recentSurats = SuratMasuk::latest('tgl_terima')->take(5)->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recents' => $recentSurats
        ]);
    }
}
