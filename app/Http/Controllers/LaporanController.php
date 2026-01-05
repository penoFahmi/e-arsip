<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\SuratKeluar;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    // ==========================================
    // 1. LAPORAN SURAT MASUK
    // ==========================================
    public function indexMasuk(Request $request)
    {
        // Default tanggal: Awal bulan ini s/d Hari ini
        $tglAwal = $request->input('tgl_awal', date('Y-m-01'));
        $tglAkhir = $request->input('tgl_akhir', date('Y-m-d'));

        // Query Data untuk Tampilan Web
        $query = SuratMasuk::with(['disposisi.keUser']) // Load user penerima disposisi
            ->whereBetween('tgl_terima', [$tglAwal, $tglAkhir])
            ->orderBy('tgl_terima', 'asc');

        // Jika ada pencarian di tabel laporan
        if ($request->search) {
            $query->where('perihal', 'like', "%{$request->search}%")
                ->orWhere('pengirim', 'like', "%{$request->search}%");
        }

        return Inertia::render('laporan/surat-masuk', [
            'surats' => $query->paginate(20)->withQueryString(), // Tampilkan di tabel
            'filters' => [
                'tgl_awal' => $tglAwal,
                'tgl_akhir' => $tglAkhir,
                'search' => $request->search
            ]
        ]);
    }

    public function cetakMasuk(Request $request)
    {
        $request->validate([
            'tgl_awal' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_awal',
        ]);

        $surats = SuratMasuk::with(['disposisi.keUser'])
            ->whereBetween('tgl_terima', [$request->tgl_awal, $request->tgl_akhir])
            ->orderBy('tgl_terima', 'asc')
            ->get();

        return view('cetak.agenda-masuk', [
            'surats'    => $surats,
            'periode'   => Carbon::parse($request->tgl_awal)->translatedFormat('d F Y') . ' s/d ' . Carbon::parse($request->tgl_akhir)->translatedFormat('d F Y'),
        ]);
    }

    // ==========================================
    // 2. LAPORAN SURAT KELUAR
    // ==========================================
    public function indexKeluar(Request $request)
    {
        $tglAwal = $request->input('tgl_awal', date('Y-m-01'));
        $tglAkhir = $request->input('tgl_akhir', date('Y-m-d'));
        $user = auth()->user();

        $query = SuratKeluar::with(['bidang'])
            ->whereBetween('tgl_surat', [$tglAwal, $tglAkhir])
            ->orderBy('tgl_surat', 'asc');

        // Filter Bidang (Kecuali Admin Pusat)
        $isGlobalAdmin = ($user->role === 'super_admin' || $user->role === 'level_1' || ($user->bidang && $user->bidang->kode === 'SEK'));
        if (!$isGlobalAdmin) {
            $query->where('id_bidang', $user->id_bidang);
        }

        if ($request->search) {
            $query->where('perihal', 'like', "%{$request->search}%")
                ->orWhere('tujuan', 'like', "%{$request->search}%");
        }

        return Inertia::render('laporan/surat-keluar', [
            'surats' => $query->paginate(20)->withQueryString(),
            'filters' => [
                'tgl_awal' => $tglAwal,
                'tgl_akhir' => $tglAkhir,
                'search' => $request->search
            ]
        ]);
    }

    public function cetakKeluar(Request $request)
    {
        $request->validate([
            'tgl_awal' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_awal',
        ]);

        $user = auth()->user();
        $query = SuratKeluar::with(['bidang'])
            ->whereBetween('tgl_surat', [$request->tgl_awal, $request->tgl_akhir])
            ->orderBy('tgl_surat', 'asc');

        $isGlobalAdmin = ($user->role === 'super_admin' || $user->role === 'level_1' || ($user->bidang && $user->bidang->kode === 'SEK'));
        if (!$isGlobalAdmin) {
            $query->where('id_bidang', $user->id_bidang);
        }

        $surats = $query->get();
        $bidangNama = (!$isGlobalAdmin && $user->bidang) ? $user->bidang->nama_bidang : 'SEMUA BIDANG';

        return view('cetak.agenda-keluar', [
            'surats'    => $surats,
            'periode'   => Carbon::parse($request->tgl_awal)->translatedFormat('d F Y') . ' s/d ' . Carbon::parse($request->tgl_akhir)->translatedFormat('d F Y'),
            'bidang_nama' => $bidangNama
        ]);
    }

    // Helper untuk ambil setting
    private function getConfig()
    {
        $settings = AppSetting::pluck('value', 'key')->toArray();
        return [
            'instansi_nama'   => $settings['instansi_name'] ?? 'PEMERINTAH KOTA PONTIANAK',
            'instansi_alamat' => $settings['instansi_alamat'] ?? 'Badan Keuangan Daerah',
        ];
    }

    // ==========================================
    // 2. CETAK LEMBAR DISPOSISI (PER SURAT)
    // ==========================================

    public function cetakDisposisi(SuratMasuk $suratMasuk)
    {
        // 1. LOAD RELATIONSHIP
        // Pastikan kita muat data User pengirim (dariUser) dan penerima (keUser)
        $suratMasuk->load(['disposisi' => function ($q) {
            $q->with(['dariUser', 'keUser'])->orderBy('id', 'asc');
        }, 'bidangPenerima']);

        // 2. FILTER LOGIC (BERDASARKAN TUJUAN SURAT / PENERIMA)

        // --- KOTAK TENGAH ($dispKaban) ---
        // Cari disposisi yang PENERIMA-nya adalah Level 2 (Kabid / Sekretaris)
        // Artinya: Instruksi dari Atasan (Kaban) UNTUK Kabid.
        $dispKaban = $suratMasuk->disposisi->first(function ($d) {
            return $d->keUser && in_array($d->keUser->role, ['level_2', 'sekretaris']);
        });

        // --- KOTAK BAWAH ($dispKabid) ---
        // Cari disposisi yang PENERIMA-nya adalah Level 3 atau 4 (Kasubbag / Staf)
        // Artinya: Instruksi dari Kabid UNTUK Staf/Kasubbag.
        $dispKabid = $suratMasuk->disposisi->first(function ($d) {
            // Role penerima sesuaikan dengan database kamu (biasanya level_3, level_4, atau kasubbag)
            return $d->keUser && in_array($d->keUser->role, ['level_3', 'level_4', 'kasubbag', 'staf']);
        });

        // 3. SETTING
        $settings = AppSetting::pluck('value', 'key')->toArray();
        $config = [
            'instansi_nama'   => $settings['instansi_name'] ?? 'PEMERINTAH KOTA PONTIANAK',
            'instansi_alamat' => $settings['instansi_alamat'] ?? 'Badan Keuangan Daerah',
        ];

        // 4. GENERATE PDF
        $pdf = Pdf::loadView('pdf.lembar-disposisi', [
            'surat'     => $suratMasuk,
            'dispKaban' => $dispKaban, // Data matang untuk kotak tengah
            'dispKabid' => $dispKabid, // Data matang untuk kotak bawah
            'config'    => $config
        ])->setPaper('a4', 'portrait');

        $safeAgenda = str_replace('/', '-', $suratMasuk->no_agenda);
        return $pdf->stream('Disposisi-' . $safeAgenda . '.pdf');
    }
}
