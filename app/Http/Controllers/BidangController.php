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
        $query = Bidang::query();

        if ($request->search) {
            $query->where('nama_bidang', 'like', "%{$request->search}%")
                  ->orWhere('kode', 'like', "%{$request->search}%");
        }

        // Ambil data dengan jumlah user di dalamnya (untuk info)
        $bidangs = $query->withCount('users')->latest()->paginate(10)->withQueryString();

        return Inertia::render('bidang/index', [
            'bidangs' => $bidangs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_bidang' => 'required|string|max:255|unique:bidang',
            'kode' => 'required|string|max:10|unique:bidang',
        ]);

        Bidang::create($request->all());

        return redirect()->back()->with('success', 'Bidang berhasil ditambahkan.');
    }

    public function update(Request $request, Bidang $bidang)
    {
        $request->validate([
            'nama_bidang' => ['required', 'string', 'max:255', Rule::unique('bidang')->ignore($bidang->id)],
            'kode' => ['required', 'string', 'max:10', Rule::unique('bidang')->ignore($bidang->id)],
        ]);

        $bidang->update($request->all());

        return redirect()->back()->with('success', 'Data bidang diperbarui.');
    }

    public function destroy(Bidang $bidang)
    {
        // Cek apakah ada user yang terdaftar di bidang ini
        if ($bidang->users()->exists()) {
            return redirect()->back()->with('error', 'Gagal hapus! Masih ada pegawai di bidang ini.');
        }

        $bidang->delete();

        return redirect()->back()->with('success', 'Bidang berhasil dihapus.');
    }
}
