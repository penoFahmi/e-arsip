<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SuratMasuk;
use App\Models\FileScan;
use App\Models\Bidang;
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

        // Eager Load relasi yang diperlukan
        $query = SuratMasuk::with(['fileScan', 'bidangPenerima'])
            ->latest('tgl_terima')
            ->latest('created_at'); // Urutan cadangan biar stabil

        // LOGIKA HAK AKSES MELIHAT SURAT
        $isSekretariat = $user->bidang && $user->bidang->kode === 'SEK';

        if ($user->role === 'super_admin' || $user->role === 'level_1' || $isSekretariat) {
            // 1. Admin, Kaban, & Sekretariat BISA LIHAT SEMUA SURAT
        } else {
            // 2. Bidang Lain / Staff HANYA LIHAT surat milik bidangnya atau disposisi ke dia
            $query->where(function ($q) use ($user) {
                $q->where('id_bidang_penerima', $user->id_bidang)
                    ->orWhereHas('disposisi', function ($d) use ($user) {
                        $d->where('ke_user_id', $user->id);
                    })
                    ->orWhere('id_user_input', $user->id);
            });
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                    ->orWhere('pengirim', 'like', "%{$request->search}%")
                    ->orWhere('no_surat', 'like', "%{$request->search}%")
                    ->orWhere('no_agenda', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('surat-masuk/index', [
            'surats' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_klasifikasi' => 'nullable|string|max:20',
            'no_surat' => 'required|string|max:100|unique:surat_masuk',
            'tgl_surat' => 'required|date',
            'tgl_terima' => 'required|date',
            'pengirim' => 'required|string|max:255',
            'perihal' => 'required|string|max:500', // Perihal panjang ok
            'ringkasan' => 'nullable|string',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'media' => 'required|in:fisik,digital',
            'file_scan' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $user = auth()->user();
        $validated['id_user_input'] = $user->id;
        $validated['status_surat'] = 'baru';

        // [LOGIKA BARU] Penentuan Unit Penerima
        // Jika User punya bidang, masuk ke bidangnya.
        // Jika User NULL bidang (Admin/Kaban), default masuk ke SEKRETARIAT.
        if ($user->id_bidang) {
            $validated['id_bidang_penerima'] = $user->id_bidang;
        } else {
            $sekretariat = Bidang::where('kode', 'SEK')->orWhere('nama_bidang', 'like', '%Sekretariat%')->first();
            $validated['id_bidang_penerima'] = $sekretariat ? $sekretariat->id : null;
        }

        DB::transaction(function () use ($validated, $request) {
            // Generate Agenda
            $validated['no_agenda'] = $this->generateSmartAgenda(
                $validated['id_bidang_penerima'],
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

            TrackingService::record($surat->id, 'input', "Surat dicatat dengan No Agenda: {$surat->no_agenda}");
        });

        return redirect()->back()->with('success', 'Surat masuk berhasil dicatat.');
    }

    private function generateSmartAgenda($idBidang, $tglTerima)
    {
        $tahun = Carbon::parse($tglTerima)->year;

        $kodeBidang = 'UM';

        if ($idBidang) {
            $bidang = Bidang::find($idBidang);
            if ($bidang) {
                $kodeBidang = $bidang->kode ?? strtoupper(substr($bidang->nama_bidang, 0, 3));
            }
        }

        $pattern = "%/{$kodeBidang}/{$tahun}";

        $lastSurat = SuratMasuk::where('no_agenda', 'like', $pattern)
            ->orderBy('id', 'desc')
            ->first();

        $nextNo = 1;
        if ($lastSurat) {
            $parts = explode('/', $lastSurat->no_agenda);
            if (isset($parts[0]) && is_numeric($parts[0])) {
                $nextNo = intval($parts[0]) + 1;
            }
        }

        $nomorUrut = str_pad($nextNo, 3, '0', STR_PAD_LEFT);
        return "{$nomorUrut}/{$kodeBidang}/{$tahun}";
    }

    public function update(Request $request, SuratMasuk $suratMasuk)
    {
        $validated = $request->validate([
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
            $suratData = collect($validated)->except(['file_scan', 'no_agenda'])->toArray();
            $suratMasuk->update($suratData);

            if ($request->hasFile('file_scan')) {
                foreach ($suratMasuk->fileScan as $oldFile) {
                    if (Storage::disk('public')->exists($oldFile->path_file)) Storage::disk('public')->delete($oldFile->path_file);
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

    // Hapus metode
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
        $suratMasuk->load(['fileScan', 'logTrackings.user', 'disposisi.dariUser', 'disposisi.keUser', 'disposisi.children', 'bidangPenerima']);
        return Inertia::render('surat-masuk/show', ['surat' => $suratMasuk]);
    }
}
