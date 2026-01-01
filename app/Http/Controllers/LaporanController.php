<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    // ==========================================
    // 1. LAPORAN BUKU AGENDA (FILTER & LIST)
    // ==========================================

    public function index()
    {
        return Inertia::render('laporan/index');
    }

    public function cetak(Request $request)
    {
        $request->validate([
            'tgl_awal' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_awal',
        ]);

        $surats = SuratMasuk::with('bidangPenerima')
            ->whereBetween('tgl_terima', [$request->tgl_awal, $request->tgl_akhir])
            ->orderBy('tgl_terima', 'asc')
            ->orderBy('no_agenda', 'asc')
            ->get();

        // Ambil nama instansi dari setting (opsional, fallback ke string)
        $instansi = AppSetting::where('key', 'instansi_name')->value('value') ?? 'BADAN KEUANGAN DAN ASET DAERAH';

        // Return View Blade untuk dicetak Browser (Ctrl+P)
        return view('cetak.agenda-masuk', [
            'surats' => $surats,
            'tgl_awal' => Carbon::parse($request->tgl_awal)->translatedFormat('d F Y'),
            'tgl_akhir' => Carbon::parse($request->tgl_akhir)->translatedFormat('d F Y'),
            'instansi' => $instansi,
        ]);
    }

    // ==========================================
    // 2. CETAK LEMBAR DISPOSISI (PER SURAT)
    // ==========================================

    public function cetakDisposisi(SuratMasuk $suratMasuk)
    {
        $suratMasuk->load(['disposisi.dariUser', 'disposisi.keUser']);

        $settings = AppSetting::pluck('value', 'key')->toArray();

        $pdf = Pdf::loadView('pdf.lembar-disposisi', [
            'surat' => $suratMasuk,
            'config' => $settings
        ])->setPaper('a4', 'portrait');

        $safeAgenda = str_replace('/', '-', $suratMasuk->no_agenda);
        $fileName = 'Disposisi-' . $safeAgenda . '.pdf';

        return $pdf->stream($fileName);
    }
}
