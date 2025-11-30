<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. SETUP DEFAULT APLIKASI (Untuk White-label)
        // Kita pakai DB::table agar aman jika Model AppSetting belum dibuat
        $settings = [
            ['key' => 'app_name', 'value' => 'Sistem Surat BKAD'],
            ['key' => 'app_description', 'value' => 'Sistem Informasi Manajemen Surat & Disposisi'],
            ['key' => 'app_logo', 'value' => null], // Nanti diupload lewat admin
            ['key' => 'instansi_address', 'value' => 'Jl. Jenderal Sudirman No. 1, Pontianak'],
        ];

        foreach ($settings as $setting) {
            DB::table('app_settings')->updateOrInsert(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 2. SETUP BIDANG UTAMA (Sekretariat)
        // Kita butuh ID ini untuk referensi, meski Super Admin id_bidangnya NULL
        $sekretariatId = DB::table('bidang')->insertGetId([
            'nama_bidang' => 'Sekretariat',
            'kode' => 'SEK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Buat bidang Anggaran (Sesuai request kamu)
        DB::table('bidang')->insert([
            'nama_bidang' => 'Bidang Anggaran',
            'kode' => 'ANG',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. SETUP SUPER ADMIN (Akun Pancingan)
        // Email ini akan dideteksi middleware untuk memaksa ganti email
        User::firstOrCreate(
            ['username' => 'superadmin'], // Cek berdasarkan username
            [
                'name' => 'Administrator Utama',
                'email' => 'admin@setup.app', // <--- EMAIL DEFAULT (PANCINGAN)
                'password' => Hash::make('password'), // Password default
                'role' => 'super_admin',
                'id_bidang' => null, // Super admin tidak terikat bidang
                'jabatan' => 'Admin Sistem',
                'email_verified_at' => null, // Belum verifikasi
                'status_aktif' => true,
            ]
        );
    }
}
