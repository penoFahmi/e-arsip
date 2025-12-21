<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use App\Models\SuratMasuk;
use App\Models\User;
use App\Models\Agenda;
use App\Models\Bidang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\TrackingService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class DisposisiController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Disposisi::with(['surat', 'dariUser', 'parent.dariUser', 'surat.fileScan'])
            ->where('ke_user_id', auth()->id())
            ->latest('tgl_disposisi');

        if ($request->search) {
            $query->whereHas('surat', function ($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('no_surat', 'like', "%{$request->search}%")
                    ->orWhere('no_agenda', 'like', "%{$request->search}%");
            });
        }
        $disposisi = $query->paginate(10)->withQueryString();
        return Inertia::render('disposisi/index', ['disposisis' => $disposisi, 'filters' => $request->only(['search'])]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_surat' => 'required|exists:surat_masuk,id',
            'parent_id' => 'nullable|exists:disposisi,id',
            'ke_user_id' => 'required|exists:users,id',
            'sifat_disposisi' => 'required|in:biasa,segera,sangat_segera,rahasia',
            'instruksi' => 'required|string',
            'batas_waktu' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $validated['dari_user_id'] = auth()->id();
        $validated['tgl_disposisi'] = now();
        $validated['status_disposisi'] = 'terkirim';

        DB::transaction(function () use ($validated, $request) {

            // 1. CEK PENERIMA (Bidang apa?)
            $penerima = User::find($request->ke_user_id);
            $idBidangPenerima = $penerima->id_bidang;

            // 2. GENERATE AGENDA LOKAL (Jika penerima adalah Bidang)
            $noAgendaLokal = null;
            if ($idBidangPenerima) {
                $noAgendaLokal = $this->generateAgendaLokal($idBidangPenerima, now());
            }

            // Tambahkan ke data yang akan disimpan
            $validated['no_agenda_penerima'] = $noAgendaLokal;

            Disposisi::create($validated);

            SuratMasuk::where('id', $request->id_surat)->update(['status_surat' => 'didisposisi']);

            if ($request->parent_id) {
                Disposisi::where('id', $request->parent_id)->update([
                    'status_disposisi' => 'selesai',
                    'catatan' => 'Disposisi diteruskan ke staf/bawahan.'
                ]);
            }

            $sifatPesan = strtoupper(str_replace('_', ' ', $validated['sifat_disposisi']));
            $msg = "Disposisi ($sifatPesan) dikirim ke {$penerima->name}.";
            if ($noAgendaLokal) $msg .= " Agenda Lokal: $noAgendaLokal";

            TrackingService::record($request->id_surat, 'disposisi_dikirim', $msg);
        });

        return redirect()->back()->with('success', 'Disposisi berhasil dikirim.');
    }

    // --- LOGIC AGENDA LOKAL (Gabungan Surat Masuk & Disposisi) ---
    private function generateAgendaLokal($idBidang, $tanggal)
    {
        $tahun = Carbon::parse($tanggal)->year;
        $bidang = Bidang::find($idBidang);
        $kodeBidang = $bidang->kode ?? 'UM';
        $pattern = "%/{$kodeBidang}/{$tahun}";

        // Cari Max di Surat Masuk (Bypass)
        $lastSurat = SuratMasuk::where('no_agenda', 'like', $pattern)
            ->orderBy('id', 'desc')->first();

        // Cari Max di Disposisi (Limpahan)
        $lastDisposisi = Disposisi::where('no_agenda_penerima', 'like', $pattern)
            ->orderBy('id', 'desc')->first();

        $maxNo = 0;

        if ($lastSurat) {
            $parts = explode('/', $lastSurat->no_agenda);
            if (isset($parts[0]) && intval($parts[0]) > $maxNo) $maxNo = intval($parts[0]);
        }

        if ($lastDisposisi) {
            $parts = explode('/', $lastDisposisi->no_agenda_penerima);
            if (isset($parts[0]) && intval($parts[0]) > $maxNo) $maxNo = intval($parts[0]);
        }

        $nomorUrut = str_pad($maxNo + 1, 3, '0', STR_PAD_LEFT);
        return "{$nomorUrut}/{$kodeBidang}/{$tahun}";
    }

    public function update(Request $request, Disposisi $disposisi)
    {
        if ($disposisi->ke_user_id !== auth()->id()) abort(403, 'Anda tidak berhak.');

        $request->validate([
            'status_disposisi' => 'required',
            'file_tindak_lanjut' => 'nullable|file|mimes:pdf,xls,xlsx,doc,docx,jpg,png|max:10240',
        ]);

        DB::transaction(function () use ($request, $disposisi) {

            $dataToUpdate = [
                'status_disposisi' => $request->status_disposisi,
                'catatan' => $request->catatan
            ];

            if ($request->hasFile('file_tindak_lanjut')) {
                if ($disposisi->file_tindak_lanjut && \Storage::disk('public')->exists($disposisi->file_tindak_lanjut)) {
                    \Storage::disk('public')->delete($disposisi->file_tindak_lanjut);
                }
                $file = $request->file('file_tindak_lanjut');
                $path = $file->store('uploads/laporan-disposisi', 'public');
                $dataToUpdate['file_tindak_lanjut'] = $path;
            }

            $disposisi->update($dataToUpdate);

            $pesan = match ($request->status_disposisi) {
                'selesai' => 'Menyelesaikan disposisi.',
                'tindak_lanjut' => 'Sedang menindaklanjuti.',
                default => 'Update status.'
            };

            // [FIX LOGIKA AGENDA]
            // Cek berbagai kemungkinan nilai boolean yang dikirim sebagai string
            $shouldCreateAgenda = filter_var($request->create_agenda, FILTER_VALIDATE_BOOLEAN) || $request->create_agenda === 'true';

            if ($shouldCreateAgenda) {
                Agenda::create([
                    'id_surat' => $disposisi->id_surat,
                    'judul_agenda' => $request->judul_agenda ?? 'Tindak Lanjut',
                    'lokasi' => $request->lokasi ?? 'Kantor',
                    'tgl_mulai' => $request->tgl_mulai,
                    'tgl_selesai' => $request->tgl_selesai,
                    'jam_mulai' => $request->jam_mulai,
                    'jam_selesai' => $request->jam_selesai,
                    'penanggung_jawab' => auth()->id(),
                    'keterangan' => "Agenda otomatis dari tindak lanjut. Catatan: " . $request->catatan,
                ]);
                $pesan .= " & Membuat Agenda Kegiatan.";
            }

            TrackingService::record($disposisi->id_surat, $request->status_disposisi, $pesan);
        });

        return redirect()->back()->with('success', 'Tindak lanjut berhasil disimpan.');
    }

    public function export(Request $request)
    {
        $fileName = 'rekap_disposisi_' . date('Y-m-d_H-i') . '.csv';

        $disposisis = Disposisi::with(['surat', 'dariUser'])
            ->where('ke_user_id', auth()->id())
            ->latest('tgl_disposisi')
            ->get();

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = array('Tanggal Terima', 'No Surat', 'Pengirim', 'Perihal', 'Instruksi', 'Sifat', 'Status', 'Catatan Anda');

        $callback = function () use ($disposisis, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($disposisis as $item) {
                $row['Tanggal Terima']  = $item->tgl_disposisi->format('d/m/Y');
                $row['No Surat']        = $item->surat->no_surat;
                $row['Pengirim']        = $item->surat->pengirim;
                $row['Perihal']         = $item->surat->perihal;
                $row['Instruksi']       = $item->dariUser->name . ': ' . $item->instruksi;
                $row['Sifat']           = strtoupper($item->sifat_disposisi);
                $row['Status']          = strtoupper($item->status_disposisi);
                $row['Catatan Anda']    = $item->catatan;

                fputcsv($file, array($row['Tanggal Terima'], $row['No Surat'], $row['Pengirim'], $row['Perihal'], $row['Instruksi'], $row['Sifat'], $row['Status'], $row['Catatan Anda']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
