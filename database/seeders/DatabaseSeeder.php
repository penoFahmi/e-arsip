<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Bidang;
use App\Models\AppSetting; // Pastikan model ini ada, atau pakai DB::table
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. BERSIHKAN DATABASE DULU (Agar tidak duplikat saat db:seed ulang)
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

            // Label Jabatan Generic (Agar User tahu Level 1 itu siapa)
            ['key' => 'label_level_1', 'value' => 'Kepala Badan'],
            ['key' => 'label_level_2', 'value' => 'Sekretaris / Kepala Bidang'],
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

        // 2. SETUP STRUKTUR ORGANISASI (BIDANG & SUB-BIDANG)
        // Kita gunakan Model Bidang agar ID-nya tercatat rapi untuk parent_id

        // A. LEVEL INDUK (Level 2 secara struktur jabatan)
        $sekretariat = Bidang::create([
            'nama_bidang' => 'Sekretariat',
            'kode' => 'SEK',
            'parent_id' => null, // Tidak punya bapak
        ]);

        $bidAnggaran = Bidang::create([
            'nama_bidang' => 'Bidang Anggaran',
            'kode' => 'ANG',
            'parent_id' => null,
        ]);

        $bidPerben = Bidang::create([
            'nama_bidang' => 'Bidang Perbendaharaan',
            'kode' => 'BEN',
            'parent_id' => null,
        ]);

        // B. LEVEL ANAK (Sub-Bagian / Sub-Bidang)
        // Anak Sekretariat
        $subUmum = Bidang::create([
            'nama_bidang' => 'Sub Bagian Umum & Aparatur',
            'kode' => 'SEK-UM',
            'parent_id' => $sekretariat->id, // Anaknya Sekretariat
        ]);

        // Anak Bidang Anggaran
        $subRenAng = Bidang::create([
            'nama_bidang' => 'Sub Bidang Perencanaan Anggaran',
            'kode' => 'ANG-REN',
            'parent_id' => $bidAnggaran->id, // Anaknya Anggaran
        ]);

        $subEvaAng = Bidang::create([
            'nama_bidang' => 'Sub Bidang Evaluasi Anggaran',
            'kode' => 'ANG-EVA',
            'parent_id' => $bidAnggaran->id, // Anaknya Anggaran
        ]);

        // 3. SETUP USERS (SESUAI HIERARKI)

        // A. SUPER ADMIN (IT / Agendaris Pusat)
        User::create([
            'name' => 'Administrator Sistem',
            'username' => 'superadmin',
            'email' => 'admin@setup.app',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'id_bidang' => null, // Tidak terikat bidang teknis
            'jabatan' => 'Admin Aplikasi',
            'status_aktif' => true,
        ]);

        // B. LEVEL 1: KEPALA BADAN (Pimpinan Tertinggi)
        User::create([
            'name' => 'Drs. Zulkarnain, M.Si',
            'username' => 'kaban',
            'email' => 'kaban@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_1', // Role Generic Level 1
            'id_bidang' => null, // Menawungi semua
            'jabatan' => 'Plt. Kepala Badan',
            'status_aktif' => true,
        ]);

        // C. LEVEL 2: SEKRETARIS & KABID
        User::create([
            'name' => 'Viktor, SE, ME',
            'username' => 'sekban',
            'email' => 'sekban@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_2',
            'id_bidang' => $sekretariat->id,
            'jabatan' => 'Sekretaris Badan',
            'status_aktif' => true,
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
        ]);

        // D. LEVEL 3: KASUBBAG / KASUBBID
        User::create([
            'name' => 'Hj. Rina Zulfina, SE',
            'username' => 'kasubbag_umum',
            'email' => 'rina@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_3',
            'id_bidang' => $subUmum->id, // Sub Bagian Umum
            'jabatan' => 'Kasubbag Umum & Aparatur',
            'status_aktif' => true,
        ]);

        User::create([
            'name' => 'Resty Utami, SE, M.Ak',
            'username' => 'kasubbid_ren',
            'email' => 'resty@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'level_3',
            'id_bidang' => $subRenAng->id, // Sub Bidang Perencanaan
            'jabatan' => 'Kasubbid Perencanaan Anggaran',
            'status_aktif' => true,
        ]);

        // E. STAF PELAKSANA
        User::create([
            'name' => 'Peno (Staf Teknis)',
            'username' => 'peno',
            'email' => 'peno@bkad.pontianak.go.id',
            'password' => Hash::make('password'),
            'role' => 'staf',
            'id_bidang' => $subRenAng->id, // Staf di bawah Bu Resty
            'jabatan' => 'Pengelola Data Anggaran',
            'status_aktif' => true,
        ]);
    }
}
