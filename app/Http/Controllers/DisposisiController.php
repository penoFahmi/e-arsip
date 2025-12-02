<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisposisiController extends Controller
{
    /**
     * Tampilkan daftar disposisi yang DITERIMA oleh user login
     */
    public function index(Request $request)
    {
        // Ambil disposisi dimana 'ke_user_id' adalah saya
        $query = Disposisi::with(['surat', 'dariUser', 'surat.fileScan'])
            ->where('ke_user_id', auth()->id())
            ->latest('tgl_disposisi');

        if ($request->search) {
            $query->whereHas('surat', function($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                  ->orWhere('no_surat', 'like', "%{$request->search}%");
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
            'ke_user_id' => 'required|exists:users,id',
            'instruksi' => 'required|string',
            'batas_waktu' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $validated['dari_user_id'] = auth()->id();
        $validated['tgl_disposisi'] = now();
        $validated['status_disposisi'] = 'terkirim';

        Disposisi::create($validated);

        // Opsional: Update status surat induk jadi 'didisposisi'
        SuratMasuk::where('id', $request->id_surat)->update(['status_surat' => 'didisposisi']);

        return redirect()->back()->with('success', 'Disposisi berhasil dikirim.');
    }

    /**
     * Update status disposisi (misal: dari 'terkirim' jadi 'selesai')
     */
    public function update(Request $request, Disposisi $disposisi)
    {
        // Pastikan yang update adalah penerima disposisi
        if ($disposisi->ke_user_id !== auth()->id()) {
            abort(403);
        }

        $disposisi->update([
            'status_disposisi' => $request->status_disposisi,
            'catatan' => $request->catatan // jika bawahan ingin balas catatan
        ]);

        return redirect()->back()->with('success', 'Status disposisi diperbarui.');
    }
}
