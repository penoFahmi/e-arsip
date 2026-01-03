<?php

namespace App\Http\Controllers;

use App\Models\SuratKeluar;
use App\Models\Bidang;
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
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';
        if (!($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat)) {
            $query->where('id_bidang', $user->id_bidang);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('tujuan', 'like', "%{$request->search}%")
                    ->orWhere('no_surat', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('surat-keluar/index', [
            'surats' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    // Simpan Surat Baru (Booking Nomor)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tgl_surat' => 'required|date',
            'tujuan' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'kode_klasifikasi' => 'nullable|string',
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($validated, $user) {
            // 1. Generate Nomor Agenda Otomatis (Format: 001/BIDANG/2025)
            $validated['no_agenda'] = $this->generateNomorAgenda($user->id_bidang, $validated['tgl_surat']);

            $validated['id_user_input'] = $user->id;
            $validated['id_bidang'] = $user->id_bidang;
            $validated['status_surat'] = 'draft';

            SuratKeluar::create($validated);
        });

        return redirect()->back()->with('success', 'Nomor surat berhasil dibooking.');
    }

    // Logic Penomoran (Sama pintarnya dengan Surat Masuk kemarin)
    private function generateNomorAgenda($idBidang, $tglSurat)
    {
        $tahun = Carbon::parse($tglSurat)->year;

        // Tentukan Kode (Misal: UM, SEK, ANG)
        $kode = 'UM'; // Default Umum
        if ($idBidang) {
            $bidang = Bidang::find($idBidang);
            if ($bidang) $kode = $bidang->kode ?? strtoupper(substr($bidang->nama_bidang, 0, 3));
        }

        // Cari nomor terakhir di tahun ini
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
        $validated = $request->validate([
            'tgl_surat' => 'required|date',
            'tujuan' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'kode_klasifikasi' => 'nullable|string',
            'no_surat' => 'nullable|string', // Diisi saat surat sudah diteken
            'file_surat' => 'nullable|file|mimes:pdf,jpg|max:5120', // Arsip PDF
            'status_surat' => 'required|in:draft,kirim,diterima', // Admin bisa ubah status manual
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
            'file_bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // Foto HP biasanya JPG
        ]);

        $path = $request->file('file_bukti')->store('uploads/tanda-terima', 'public');

        $suratKeluar->update([
            'file_bukti' => $path,
            'status_surat' => 'diterima',
        ]);

        return redirect()->back()->with('success', 'Bukti tanda terima berhasil diupload. Surat selesai.');
    }

    public function destroy(SuratKeluar $suratKeluar)
    {
        if ($suratKeluar->file_surat) Storage::disk('public')->delete($suratKeluar->file_surat);
        if ($suratKeluar->file_bukti) Storage::disk('public')->delete($suratKeluar->file_bukti);
        $suratKeluar->delete();
        return redirect()->back()->with('success', 'Surat dihapus.');
    }
}
