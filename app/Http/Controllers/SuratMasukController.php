<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SuratMasuk;
use App\Models\FileScan;
use App\Models\Bidang; // Jangan lupa import Bidang
use App\Services\TrackingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuratMasukController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // Load relasi bidang penerima agar tahu ini surat nyasar ke mana
        $query = SuratMasuk::with(['fileScan', 'bidangPenerima'])
            ->latest('tgl_terima');

        // --- FILTER HAK AKSES SURAT ---

        // 1. Super Admin, Level 1 (Kaban), & Sekretariat (Biasanya Level 2 dengan kode SEK)
        // Mereka bisa melihat SEMUA surat (Fungsi Pengawasan/Umum)
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';

        if ($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat) {
            // Level admin super Bisa lihat semua, tidak di-filter.
        }
        else {
            // 2. Bidang Teknis / Staf (Hanya lihat yg relevan)
            $query->where(function($q) use ($user) {
                // A. Surat yang TUJUAN AWALNYA ke bidang saya (Bypass)
                $q->where('id_bidang_penerima', $user->id_bidang)

                // B. ATAU Surat umum yang tujuannya NULL (Masuk lewat Kaban/Sekretariat)
                // TAPI hanya jika sudah didisposisikan ke saya atau bawahan saya
                  ->orWhereHas('disposisi', function($d) use ($user) {
                      // Cek apakah ada disposisi yang mengarah ke user ini
                      $d->where('ke_user_id', $user->id);
                  })

                  // ATAU saya yang input suratnya
                  ->orWhere('id_user_input', $user->id);
            });
        }

        // --- FILTER PENCARIAN ---
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('pengirim', 'like', "%{$request->search}%")
                    ->orWhere('no_surat', 'like', "%{$request->search}%")
                    ->orWhere('kode_klasifikasi', 'like', "%{$request->search}%") // Bisa cari kode
                    ->orWhere('no_agenda', 'like', "%{$request->search}%");
            });
        }

        $surats = $query->paginate(10)->withQueryString();

        // Data untuk Modal (User & Daftar Bidang untuk tujuan surat)
        $users = User::where('id', '!=', auth()->id())
            ->where('status_aktif', true)
            ->select('id', 'name', 'jabatan', 'role')
            ->get();

        $bidangs = Bidang::select('id', 'nama_bidang')->get();

        return Inertia::render('surat-masuk/index', [
            'surats' => $surats,
            'users' => $users,
            'bidangs' => $bidangs, // Kirim list bidang ke frontend
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // 'no_agenda' => 'nullable|string|max:50',
            'kode_klasifikasi' => 'nullable|string|max:20', // [BARU]
            'id_bidang_penerima' => 'nullable|exists:bidang,id', // [BARU]
            'no_surat' => 'required|string|max:100|unique:surat_masuk',
            'tgl_surat' => 'required|date',
            'tgl_terima' => 'required|date',
            'pengirim' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'ringkasan' => 'nullable|string',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'media' => 'required|in:fisik,digital',
            'file_scan' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $validated['id_user_input'] = auth()->id();
        $validated['status_surat'] = 'baru';

        DB::transaction(function () use ($validated, $request) {

            // Generate No Agenda Otomatis
            $validated['no_agenda'] = $this->generateNoAgenda(
                $validated['id_bidang_penerima'] ?? null,
                $validated['tgl_terima']
            );

            $suratData = collect($validated)->except('file_scan')->toArray();
            $surat = SuratMasuk::create($suratData);

            if ($request->hasFile('file_scan')) {
                $file = $request->file('file_scan');
                $path = $file->store('uploads/surat-masuk', 'public');

                FileScan::create([
                    'id_surat' => $surat->id,
                    'nama_file' => $file->getClientOriginalName(),
                    'path_file' => $path,
                    'tipe_file' => $file->extension(),
                    'ukuran_file' => $file->getSize(),
                ]);
            }

            TrackingService::record(
                $surat->id,
                'input',
                'Surat masuk dicatat.' . ($surat->id_bidang_penerima ? ' (Langsung ke Bidang)' : ' (Jalur Umum)')
            );
        });

        return redirect()->back()->with('success', 'Surat masuk berhasil dicatat.');

    }

    // Generator Nomor Agenda
    private function generateNoAgenda($idBidang, $tglTerima)
    {
        // 1. Ambil Tahun dari Tanggal Terima
        $tahun = Carbon::parse($tglTerima)->year;

        // 2. Cari nomor terakhir di Database
        // Syarat: Tahun sama DAN Bidang sama
        $lastNo = SuratMasuk::whereYear('tgl_terima', $tahun)
            ->where('id_bidang_penerima', $idBidang)
            ->selectRaw('MAX(CAST(no_agenda as UNSIGNED)) as max_no') // Ambil angka tertinggi
            ->value('max_no');

        // 3. Tambah 1
        $newNo = ($lastNo ?? 0) + 1;

        // 4. (Opsional) Format jadi string, misal "001"
        // Kalau mau polos angka saja, cukup return $newNo;
        return str_pad($newNo, 3, '0', STR_PAD_LEFT); // Hasil: 001, 002, 010
    }

    /**
     * Update data surat & Ganti File jika ada
     */
    public function update(Request $request, SuratMasuk $suratMasuk)
    {
        $validated = $request->validate([
            // 'no_agenda' => 'nullable|string|max:50',
            'kode_klasifikasi' => 'nullable|string|max:20',
            'id_bidang_penerima' => 'nullable|exists:bidang,id',
            'no_surat' => 'required|string|max:100|unique:surat_masuk,no_surat,' . $suratMasuk->id,
            'tgl_surat' => 'required|date',
            'tgl_terima' => 'required|date',
            'pengirim' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'ringkasan' => 'nullable|string',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'media' => 'required|in:fisik,digital',
            'file_scan' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        DB::transaction(function () use ($validated, $request, $suratMasuk) {
            $suratData = collect($validated)
                ->except(['file_scan', 'no_agenda'])
                ->toArray();

            $suratMasuk->update($suratData);

            if ($request->hasFile('file_scan')) {
                foreach ($suratMasuk->fileScan as $oldFile) {
                    if (Storage::disk('public')->exists($oldFile->path_file)) {
                        Storage::disk('public')->delete($oldFile->path_file);
                    }
                    $oldFile->delete();
                }

                $file = $request->file('file_scan');
                $path = $file->store('uploads/surat-masuk', 'public');

                FileScan::create([
                    'id_surat' => $suratMasuk->id,
                    'nama_file' => $file->getClientOriginalName(),
                    'path_file' => $path,
                    'tipe_file' => $file->extension(),
                    'ukuran_file' => $file->getSize(),
                ]);
            }

            TrackingService::record($suratMasuk->id, 'edit', 'Data surat diperbarui');
        });

        return redirect()->back()->with('success', 'Data surat berhasil diperbarui.');
    }

    public function destroy(SuratMasuk $suratMasuk)
    {
        foreach ($suratMasuk->fileScan as $file) {
            if (Storage::disk('public')->exists($file->path_file)) {
                Storage::disk('public')->delete($file->path_file);
            }
        }
        $suratMasuk->delete();

        return redirect()->back()->with('success', 'Surat dihapus.');
    }

    public function show(SuratMasuk $suratMasuk)
    {
        $suratMasuk->load([
            'fileScan',
            'logTrackings.user',
            'disposisi.dariUser',
            'disposisi.keUser',
            'disposisi.children',
            'bidangPenerima'
        ]);

        return Inertia::render('surat-masuk/show', [
            'surat' => $suratMasuk
        ]);
    }
}
