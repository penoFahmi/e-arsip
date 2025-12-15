<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\TrackingService;
use Illuminate\Support\Facades\DB;

class DisposisiController extends Controller
{
    /**
     * Tampilkan daftar disposisi yang DITERIMA oleh user login
     */
    public function index(Request $request)
    {
        // Ambil disposisi dimana 'ke_user_id' adalah saya
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

        return Inertia::render('disposisi/index', [
            'disposisis' => $disposisi,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Simpan Disposisi Baru
     */
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

            Disposisi::create($validated);

            // Opsional: Update status surat induk jadi 'didisposisi'
            SuratMasuk::where('id', $request->id_surat)->update(['status_surat' => 'didisposisi']);

            // Jika ini adalah "terusan" disposisi (parent_id ada)
            //maka disposisi induk otomatis kita tandai selesai atau tindak lanjut
            if ($request->parent_id) {
                Disposisi::where('id', $request->parent_id)->update([
                    'status_disposisi' => 'selesai',
                    'catatan' => 'Disposisi diteruskan ke staf/bawahan.'
                ]);
            }

            // Catat Log Tracking
            $sifatPesan = strtoupper(str_replace('_', ' ', $validated['sifat_disposisi']));
            TrackingService::record(
                $request->id_surat,
                'disposisi_dikirim',
                "Disposisi ($sifatPesan) dikirim ke User ID: {$request->ke_user_id}"
            );
        });

        return redirect()->back()->with('success', 'Disposisi berhasil dikirim.');

        $disposisi = Disposisi::latest()->first();

        $penerima = User::find($request->ke_user_id);
        // Catat tracking
        TrackingService::record(
            $request->id_surat,
            'disposisi_dikirim',
            "Disposisi dikirim ke user ID: {$request->ke_user_id}"
        );
    }

    /**
     * Update status disposisi (misal: dari 'terkirim' jadi 'selesai')
     */
    public function update(Request $request, Disposisi $disposisi)
    {
        // Pastikan yang update adalah penerima disposisi
        if ($disposisi->ke_user_id !== auth()->id()) {
            abort(403, 'Anda tidak berhak memproses disposi ini.');
        }

        $disposisi->update([
            'status_disposisi' => $request->status_disposisi,
            'catatan' => $request->catatan
        ]);

        // --- TAMBAHAN TRACKING ---
        // Log pesan berbeda tergantung status
        $pesan = match ($request->status_disposisi) {
            'dibaca' => 'Membaca disposisi masuk',
            'tindak_lanjut' => 'Sedang menindaklanjuti disposisi',
            'selesai' => 'Menyelesaikan disposisi. Laporan: ' . $request->catatan,
            default => 'Mengupdate disposisi'
        };

        TrackingService::record(
            $disposisi->id_surat,
            $request->status_disposisi, // aksi: selesai/proses/dibaca
            $pesan
        );

        return redirect()->back()->with('success', 'Status disposisi diperbarui.');
    }
}
