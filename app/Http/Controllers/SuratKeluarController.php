<?php

namespace App\Http\Controllers;

use App\Models\SuratKeluar;
use App\Models\Bidang; // Pastikan ini ada
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuratKeluarController extends Controller
{
    // Tampilkan Daftar Surat Keluar
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = SuratKeluar::with(['user', 'bidang'])->latest('tgl_surat');

        // Cek Hak Akses Admin/Sekretariat
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';
        $isAdminOrKaban = ($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat);

        // 1. Filter Hak Akses Dasar (Staf Bidang cuma lihat punya sendiri)
        if (!$isAdminOrKaban) {
            $query->where('id_bidang', $user->id_bidang);
        }

        // 2. Filter Pencarian Teks
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('tujuan', 'like', "%{$request->search}%")
                    ->orWhere('no_surat', 'like', "%{$request->search}%");
            });
        }

        // 3. [BARU] Filter Dropdown Bidang (Khusus Admin biar gak pusing)
        if ($request->bidang && $isAdminOrKaban) {
            $query->where('id_bidang', $request->bidang);
        }

        return Inertia::render('surat-keluar/index', [
            'surats' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'bidang']),
            // Kirim data bidang untuk dropdown filter
            'bidangs' => Bidang::select('id', 'nama_bidang')->orderBy('nama_bidang')->get(),
            'canFilterBidang' => $isAdminOrKaban,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tgl_surat' => 'required|date',
            'no_surat' => 'required|string|max:255', // Wajib ada karena surat sudah jadi
            'tujuan' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'kode_klasifikasi' => 'nullable|string',
            'file_surat' => 'nullable|file|mimes:pdf,jpg,jpeg|max:10240', // Bisa langsung upload
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($validated, $user, $request) {
            // 1. Generate Nomor Agenda (Tetap perlu untuk ID unik sistem per bidang)
            $validated['no_agenda'] = $this->generateNomorAgenda($user->id_bidang, $validated['tgl_surat']);

            $validated['id_user_input'] = $user->id;
            $validated['id_bidang'] = $user->id_bidang;

            // Status langsung 'diterima' atau 'kirim' karena ini arsip jadi
            $validated['status_surat'] = 'kirim';

            // 2. Handle File Upload jika ada
            if ($request->hasFile('file_surat')) {
                $validated['file_surat'] = $request->file('file_surat')->store('uploads/surat-keluar', 'public');
            }

            SuratKeluar::create($validated);
        });

        return redirect()->back()->with('success', 'Arsip surat keluar berhasil disimpan.');
    }

    private function generateNomorAgenda($idBidang, $tglSurat)
    {
        $tahun = Carbon::parse($tglSurat)->year;
        $kode = 'SEK';
        if ($idBidang) {
            $bidang = Bidang::find($idBidang);
            if ($bidang) $kode = $bidang->kode ?? strtoupper(substr($bidang->nama_bidang, 0, 3));
        }

        $pattern = "%/{$kode}/{$tahun}";
        $lastSurat = SuratKeluar::where('no_agenda', 'like', $pattern)->orderBy('id', 'desc')->first();

        $nextNo = 1;
        if ($lastSurat) {
            $parts = explode('/', $lastSurat->no_agenda);
            if (is_numeric($parts[0])) $nextNo = intval($parts[0]) + 1;
        }

        return str_pad($nextNo, 3, '0', STR_PAD_LEFT) . "/{$kode}/{$tahun}";
    }

    public function update(Request $request, SuratKeluar $suratKeluar)
    {
        $user = auth()->user();

        // [SECURITY BARU] Cek kepemilikan
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';
        $isOwner = $suratKeluar->id_bidang == $user->id_bidang;

        if (!($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat || $isOwner)) {
            abort(403, 'Anda tidak berhak mengedit surat dari bidang lain.');
        }

        $validated = $request->validate([
            'tgl_surat' => 'required|date',
            'tujuan' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'kode_klasifikasi' => 'nullable|string',
            'no_surat' => 'nullable|string',
            'file_surat' => 'nullable|file|mimes:pdf,jpg|max:5120',
            'status_surat' => 'required|in:draft,kirim,diterima',
        ]);

        if ($request->hasFile('file_surat')) {
            if ($suratKeluar->file_surat) Storage::disk('public')->delete($suratKeluar->file_surat);
            $validated['file_surat'] = $request->file('file_surat')->store('uploads/surat-keluar', 'public');
        }

        $suratKeluar->update($validated);

        return redirect()->back()->with('success', 'Data surat keluar diperbarui.');
    }

    public function uploadBukti(Request $request, SuratKeluar $suratKeluar)
    {
        $request->validate([
            'file_bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('file_bukti')->store('uploads/tanda-terima', 'public');

        $suratKeluar->update([
            'file_bukti' => $path,
            'status_surat' => 'diterima',
        ]);

        return redirect()->back()->with('success', 'Bukti tanda terima berhasil diupload.');
    }

    public function destroy(SuratKeluar $suratKeluar)
    {
        $user = auth()->user();

        // [SECURITY BARU] Cek kepemilikan sebelum hapus
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';
        $isOwner = $suratKeluar->id_bidang == $user->id_bidang;

        if (!($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat || $isOwner)) {
            abort(403, 'Anda tidak berhak menghapus surat ini.');
        }

        if ($suratKeluar->file_surat) Storage::disk('public')->delete($suratKeluar->file_surat);
        if ($suratKeluar->file_bukti) Storage::disk('public')->delete($suratKeluar->file_bukti);
        $suratKeluar->delete();

        return redirect()->back()->with('success', 'Surat dihapus.');
    }
}
