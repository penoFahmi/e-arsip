<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\AppSetting;

class ReportController extends Controller
{
    /**
     * Cetak Lembar Disposisi Satuan (Mirip Foto Fisik)
     */
    public function printDisposisi(SuratMasuk $suratMasuk)
    {
        $suratMasuk->load(['disposisi.dariUser', 'disposisi.keUser']);

        // 1. Ambil Semua Setting dari Database
        // Hasilnya array: ['instansi_name' => 'BKAD', 'disposisi_level_1' => 'Sekretaris...', dll]
        $settings = AppSetting::pluck('value', 'key')->toArray();

        // 2. Kirim data settings ke View
        $pdf = Pdf::loadView('pdf.lembar-disposisi', [
            'surat' => $suratMasuk,
            'config' => $settings // Kita sebut variabelnya 'config'
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Disposisi-' . $suratMasuk->no_agenda . '.pdf');
    }

    /**
     * Cetak Buku Agenda (Laporan Bulanan/Harian)
     */
    public function printAgenda(Request $request)
    {
        $query = SuratMasuk::query();

        // Filter Berdasarkan Tanggal (Opsional)
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('tgl_terima', [$request->start_date, $request->end_date]);
        }

        $data = $query->orderBy('no_agenda', 'asc')->get();

        $pdf = Pdf::loadView('pdf.laporan-agenda', [
            'data' => $data,
            'periode' => $request->start_date ? "$request->start_date s/d $request->end_date" : 'Semua Data'
        ])->setPaper('f4', 'landscape'); // Pakai F4 atau Legal landscape biar muat banyak kolom

        return $pdf->stream('Laporan-Agenda-Surat.pdf');
    }
}
