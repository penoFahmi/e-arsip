<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\FileScan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SuratMasukController extends Controller
{
    public function index(Request $request)
    {
        $query = SuratMasuk::with(['fileScan'])
            ->latest('tgl_terima');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('perihal', 'like', "%{$request->search}%")
                  ->orWhere('pengirim', 'like', "%{$request->search}%")
                  ->orWhere('no_surat', 'like', "%{$request->search}%");
            });
        }

        $surats = $query->paginate(10)->withQueryString();

        return Inertia::render('surat-masuk/index', [
            'surats' => $surats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
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
        });

        return redirect()->back()->with('success', 'Surat masuk berhasil dicatat.');
    }

    /**
     * Update data surat & Ganti File jika ada
     */
    public function update(Request $request, SuratMasuk $suratMasuk)
    {
        $validated = $request->validate([
            'no_surat' => 'required|string|max:100|unique:surat_masuk,no_surat,'.$suratMasuk->id,
            'tgl_surat' => 'required|date',
            'tgl_terima' => 'required|date',
            'pengirim' => 'required|string|max:255',
            'perihal' => 'required|string|max:255',
            'ringkasan' => 'nullable|string',
            'sifat_surat' => 'required|in:biasa,penting,rahasia',
            'media' => 'required|in:fisik,digital',
            // File validasi (nullable artinya user tidak wajib upload ulang)
            'file_scan' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        DB::transaction(function () use ($validated, $request, $suratMasuk) {
            // 1. Update Data Teks
            $suratData = collect($validated)->except('file_scan')->toArray();
            $suratMasuk->update($suratData);

            // 2. Cek Jika Ada File Baru Diupload
            if ($request->hasFile('file_scan')) {

                // A. Hapus File Lama Fisik & Database
                foreach ($suratMasuk->fileScan as $oldFile) {
                    if (Storage::disk('public')->exists($oldFile->path_file)) {
                        Storage::disk('public')->delete($oldFile->path_file);
                    }
                    $oldFile->delete();
                }

                // B. Upload File Baru
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
        });

        return redirect()->back()->with('success', 'Data surat berhasil diperbarui.');
    }

    /**
     * Hapus surat beserta file fisiknya (PENTING BIAR TIDAK PENUH)
     */
    public function destroy(SuratMasuk $suratMasuk)
    {
        // 1. Hapus file fisik di folder storage
        foreach ($suratMasuk->fileScan as $file) {
            if (Storage::disk('public')->exists($file->path_file)) {
                Storage::disk('public')->delete($file->path_file);
            }
        }

        // 2. Hapus data di database
        // Karena relasi foreign key file_scan biasanya ON DELETE CASCADE,
        // record di tabel file_scan akan otomatis hilang saat surat dihapus.
        // Tapi menghapus file fisiknya harus manual seperti kode di atas.
        $suratMasuk->delete();

        return redirect()->back()->with('success', 'Surat dan file lampiran berhasil dihapus.');
    }
}
