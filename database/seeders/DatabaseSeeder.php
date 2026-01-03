<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Bidang;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

use function Symfony\Component\Clock\now;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. BERSIHKAN DATABASE DULU
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Bidang::truncate();
        DB::table('app_settings')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. SETUP DEFAULT APLIKASI (App Settings)
        $settings = [
            ['key' => 'app_name', 'value' => 'E-Arsip BKAD'],
            ['key' => 'instansi_nama', 'value' => 'BADAN KEUANGAN DAN ASET DAERAH'],
            ['key' => 'instansi_alamat', 'value' => 'Jl. Jenderal Sudirman No. 1, Pontianak'],
            ['key' => 'app_description', 'value' => 'Sistem Informasi Manajemen Surat & Disposisi'],
            ['key' => 'label_level_1', 'value' => 'Kepala Badan'],
            ['key' => 'label_level_2', 'value' => 'Sekretaris / Kepala Bidang'],
            ['key' => 'admin_bidang', 'value' => 'Admin Bidang'],
            ['key' => 'label_level_3', 'value' => 'Kasubbag / Kasubbid'],
        ];

        foreach ($settings as $setting) {
            DB::table('app_settings')->insert([
                'key' => $setting['key'],
                'value' => $setting['value'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ==========================================
        // 2. SETUP STRUKTUR ORGANISASI (HIERARKI)
        // ==========================================

        // A. LEVEL 1: ROOT (KEPALA BADAN)
        // Ini adalah "Wadah" untuk Pak Kaban agar muncul paling atas di Tree View
        $unitKaban = Bidang::create([
            'nama_bidang' => 'Kepala Badan',
            'kode' => 'KABAN',
            'parent_id' => null,
        ]);

        // B. LEVEL 2: SEKRETARIAT & BIDANG (Anak dari Kepala Badan)
        $sekretariat = Bidang::create([
            'nama_bidang' => 'Sekretariat',
            'kode' => 'SEK',
            'parent_id' => $unitKaban->id, // Bawahan Kaban
        ]);

        $bidAnggaran = Bidang::create([
            'nama_bidang' => 'Bidang Anggaran',
            'kode' => 'ANG',
            'parent_id' => $unitKaban->id, // Bawahan Kaban
        ]);

        $bidPerben = Bidang::create([
            'nama_bidang' => 'Bidang Perbendaharaan',
            'kode' => 'BEN',
            'parent_id' => $unitKaban->id, // Bawahan Kaban
        ]);

        $bidAset = Bidang::create([
            'nama_bidang' => 'Bidang Aset',
            'kode' => 'AST',
            'parent_id' => $unitKaban->id, // Bawahan Kaban
        ]);

        // C. LEVEL 3: SUB-BAGIAN & SUB-BIDANG (Cucu Kepala Badan)

        // Anak Sekretariat
        $subUmum = Bidang::create([
            'nama_bidang' => 'Sub Bagian Umum & Aparatur',
            'kode' => 'SEK-UM',
            'parent_id' => $sekretariat->id,
        ]);

        $subKeuangan = Bidang::create([
            'nama_bidang' => 'Sub Bagian Keuangan',
            'kode' => 'SEK-KEU',
            'parent_id' => $sekretariat->id,
        ]);

        // Anak Bidang Anggaran
        $subRenAng = Bidang::create([
            'nama_bidang' => 'Sub Bidang Perencanaan Anggaran',
            'kode' => 'ANG-REN',
            'parent_id' => $bidAnggaran->id,
        ]);

        $subEvaAng = Bidang::create([
            'nama_bidang' => 'Sub Bidang Evaluasi Anggaran',
            'kode' => 'ANG-EVA',
            'parent_id' => $bidAnggaran->id,
        ]);

        $subRenAng = Bidang::create([
            'nama_bidang' => 'Staf Sub Bidang Perencanaan Anggaran',
            'kode' => 'Staf Anggaran',
            'parent_id' => $subRenAng->id,
        ]);

        // ==========================================
        // 3. SETUP USERS
        // ==========================================

        // A. SUPER ADMIN (Di Luar Struktur / Hantu)
        User::create([
            'name' => 'Administrator Sistem',
            'username' => 'superadmin',
            'email' => 'admin@setup.app',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'id_bidang' => null,
            'jabatan' => 'Admin Aplikasi',
            'status_aktif' => true,
        ]);
        User::create([
            'name' => 'Peno DEV',
            'username' => 'developer',
            'email' => 'penofahmi@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'id_bidang' => null,
            'jabatan' => 'Developer',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        // B. KEPALA BADAN (Masuk ke Unit Kaban)
        User::create([
            'name' => 'Drs. Zulkarnain, M.Si',
            'username' => 'kaban',
            'email' => 'kaban@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_1',
            'id_bidang' => $unitKaban->id,
            'jabatan' => 'Plt. Kepala Badan',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        // C. SEKRETARIS & KABID (Level 2)
        User::create([
            'name' => 'Viktor, SE, ME',
            'username' => 'sekban',
            'email' => 'sekban@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_2',
            'id_bidang' => $sekretariat->id,
            'jabatan' => 'Sekretaris Badan',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Yennie Murdiani, SE',
            'username' => 'kabid_anggaran',
            'email' => 'yennie@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_2',
            'id_bidang' => $bidAnggaran->id,
            'jabatan' => 'Kepala Bidang Anggaran',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        // D. KASUBBAG / KASUBBID (Level 3)
        User::create([
            'name' => 'Hj. Rina Zulfina, SE',
            'username' => 'kasubbag_umum',
            'email' => 'rina@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_3',
            'id_bidang' => $subUmum->id,
            'jabatan' => 'Kasubbag Umum & Aparatur',
            'status_aktif' => true,
        ]);

        User::create([
            'name' => 'Resty Utami, SE, M.Ak',
            'username' => 'kasubbid_ren',
            'email' => 'resty@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_3',
            'id_bidang' => $subRenAng->id,
            'jabatan' => 'Kasubbid Perencanaan Anggaran',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        // E. STAF PELAKSANA
        User::create([
            'name' => 'Peno (Admin Bidang)',
            'username' => 'peno',
            'email' => 'peno@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'admin_bidang',
            'id_bidang' => $bidAnggaran->id,
            'jabatan' => 'Pengelola EArsip Anggaran',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Peno (Staf Keuangan)',
            'username' => 'peno_keuangan',
            'email' => 'peno_keuangan@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'staf',
            'id_bidang' => $bidAnggaran->id,
            'jabatan' => 'Staf Administrasi',
            'status_aktif' => true,
            'email_verified_at' => now(),
        ]);
    }
}
