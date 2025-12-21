<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class BidangController extends Controller
{
public function index(Request $request)
    {
        // Jika sedang Search: Tampilkan Flat (Datar) biar ketemu semua
        if ($request->search) {
            $bidangs = Bidang::withCount('users')
                ->where('nama_bidang', 'like', "%{$request->search}%")
                ->orWhere('kode', 'like', "%{$request->search}%")
                ->get();
        } else {
            // Tampilan Normal: Ambil ROOT saja (yang tidak punya parent)
            // Relasi 'children' akan otomatis mengambil anak-anaknya secara berjenjang
            $bidangs = Bidang::whereNull('parent_id')
                ->withCount('users')
                ->with(['children' => function ($q) {
                    $q->withCount('users'); // Hitung user di level anak
                }])
                ->orderBy('id', 'asc') // Atau orderBy 'kode'
                ->get();
        }

        return Inertia::render('bidang/index', [
            'bidangs' => $bidangs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_bidang' => 'required|string|max:255',
            'kode' => 'nullable|string|max:20',
            'parent_id' => 'nullable|exists:bidang,id',
        ]);

        Bidang::create($request->all());

        return redirect()->back()->with('success', 'Unit kerja berhasil ditambahkan.');
    }

    public function update(Request $request, Bidang $bidang)
    {
        $request->validate([
            'nama_bidang' => 'required|string|max:255',
            'kode' => 'nullable|string|max:20',
        ]);

        $bidang->update($request->all());

        return redirect()->back()->with('success', 'Unit kerja diperbarui.');
    }

    public function destroy(Bidang $bidang)
    {
        if ($bidang->users()->exists()) {
            return redirect()->back()->with('error', 'Gagal hapus! Masih ada pegawai di unit ini.');
        }
        if ($bidang->children()->exists()) {
            return redirect()->back()->with('error', 'Gagal hapus! Unit ini memiliki sub-unit di bawahnya.');
        }

        $bidang->delete();
        return redirect()->back()->with('success', 'Unit kerja berhasil dihapus.');
    }
}
