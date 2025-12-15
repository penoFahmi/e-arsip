<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\AppSetting;
use Inertia\Inertia;

class AppSettingController extends Controller
{
    /**
     * Tampilkan halaman form pengaturan
     */
    public function index()
    {
        // Proteksi: Hanya Super Admin yang boleh akses
        if (auth()->user()->role !== 'super_admin') {
            abort(403, 'Akses ditolak.');
        }

        // Ambil semua setting dari DB dan ubah formatnya jadi array Key-Value
        // Contoh: ['app_name' => 'E-Arsip', 'app_logo' => '...']
        $settings = DB::table('app_settings')->pluck('value', 'key')->toArray();

        return Inertia::render('settings/app', [
            'settings' => $settings
        ]);
    }

    /**
     * Simpan pengaturan
     */
    public function update(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $request->validate([
            'app_name' => 'required|string|max:50',
            'instansi_name' => 'required|string|max:100',
            'app_description' => 'nullable|string|max:255',
            'app_logo' => 'nullable|image|max:2048', // Max 2MB
        ]);

        // 1. Array data yang akan disimpan (Key => Value)
        $data = [
            'app_name' => $request->app_name,
            'instansi_name' => $request->instansi_name,
            'app_description' => $request->app_description,
        ];

        // 2. Handle Upload Logo (Jika ada file baru)
        if ($request->hasFile('app_logo')) {
            // Hapus logo lama jika ada
            $oldLogo = DB::table('app_settings')->where('key', 'app_logo')->value('value');
            if ($oldLogo && Storage::exists('public/' . $oldLogo)) {
                Storage::delete('public/' . $oldLogo);
            }

            // Simpan logo baru
            $path = $request->file('app_logo')->store('uploads/logos', 'public');
            $data['app_logo'] = $path;
        }

        // 3. Simpan ke Database (Looping updateOrInsert)
        foreach ($data as $key => $value) {
            DB::table('app_settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'updated_at' => now(),
                    // Jika data baru, set created_at
                    'created_at' => DB::raw('IFNULL(created_at, NOW())')
                ]
            );
        }

        // 4. PENTING: Hapus Cache agar perubahan langsung nampil di Sidebar
        cache()->forget('app_settings_global');

        return redirect()->back()->with('success', 'Pengaturan aplikasi berhasil diperbarui.');
    }
/**
     * HALAMAN 1: PENGATURAN DISPOSISI
     * Menampilkan Form
     */
    public function editDisposisi()
    {
        // Ambil semua setting jadikan array ['key' => 'value']
        // Ini agar React bisa membaca default value-nya
        $settings = AppSetting::pluck('value', 'key');

        // Panggil file React: resources/js/pages/settings/disposisi.tsx
        return Inertia::render('settings/disposisi', [
            'settings' => $settings
        ]);
    }

    /**
     * Simpan Perubahan Disposisi
     */
    public function updateDisposisi(Request $request)
    {
        // Ambil semua input dari form React
        $data = $request->all();

        // Simpan loop ke database
        foreach ($data as $key => $value) {
            // Hindari menyimpan token atau null value yang tidak perlu
            if ($value !== null && $key !== '_token') {
                AppSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        return redirect()->back()->with('success', 'Label disposisi berhasil diperbarui.');
    }
}
