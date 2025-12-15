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
        $query = Bidang::with('parent') // [BARU] Load data induknya
            ->withCount('users');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama_bidang', 'like', "%{$request->search}%")
                  ->orWhere('kode', 'like', "%{$request->search}%");
            });
        }

        // Urutkan: Induk dulu, baru anak (opsional)
        $bidangs = $query->orderBy('parent_id', 'asc')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // [BARU] Kita butuh daftar bidang untuk Pilihan Parent di Modal (Dropdown)
        // Ambil semua bidang kecuali yang sedang diedit (nanti difilter di frontend kalau perlu)
        $allBidangs = Bidang::select('id', 'nama_bidang')->get();

        return Inertia::render('bidang/index', [
            'bidangs' => $bidangs,
            'allBidangs' => $allBidangs, // Kirim ke frontend untuk dropdown
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_bidang' => 'required|string|max:255|unique:bidang',
            'kode' => 'nullable|string|max:20|unique:bidang', // Kode boleh null
            'parent_id' => 'nullable|exists:bidang,id', // [BARU] Validasi Parent
        ]);

        Bidang::create($request->all());

        return redirect()->back()->with('success', 'Unit kerja berhasil ditambahkan.');
    }

    public function update(Request $request, Bidang $bidang)
    {
        $request->validate([
            'nama_bidang' => ['required', 'string', 'max:255', Rule::unique('bidang')->ignore($bidang->id)],
            'kode' => ['nullable', 'string', 'max:20', Rule::unique('bidang')->ignore($bidang->id)],
            'parent_id' => ['nullable', 'exists:bidang,id', 'different:id'], // Parent tidak boleh diri sendiri
        ]);

        $bidang->update($request->all());

        return redirect()->back()->with('success', 'Data unit kerja diperbarui.');
    }

    public function destroy(Bidang $bidang)
    {
        // Cek User
        if ($bidang->users()->exists()) {
            return redirect()->back()->with('error', 'Gagal hapus! Masih ada pegawai di unit ini.');
        }

        // [BARU] Cek apakah dia punya anak (Sub-Bidang)?
        if ($bidang->children()->exists()) {
            return redirect()->back()->with('error', 'Gagal hapus! Unit ini membawahi unit lain (memiliki sub-bidang).');
        }

        $bidang->delete();

        return redirect()->back()->with('success', 'Unit kerja berhasil dihapus.');
    }
}
