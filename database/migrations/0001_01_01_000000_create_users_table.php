<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // --- Identitas Dasar ---
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // --- Struktur Organisasi ---
            $table->string('jabatan')->nullable(); // Contoh: "Kasubbag Umum", "Staff IT"

            // PENTING: Menghubungkan user ke tabel 'bidang' (Dibuat nanti)
            // Kita pakai unsignedBigInteger dulu agar tidak error jika tabel bidang belum dibuat
            // Jika null, berarti dia user tingkat instansi (Sekretariat/Super Admin)
            $table->unsignedBigInteger('id_bidang')->nullable()->index();

            // --- Hak Akses (Role) ---
            // super_admin  : Sekretariat (Bisa ganti Logo, Tambah User, Lihat Semua)
            // admin_bidang : Admin per bagian (Misal: Admin Anggaran)
            // pimpinan     : Kepala Dinas / Kabid (Mode baca & disposisi)
            // staf         : Input & proses surat biasa
            $table->enum('role', ['super_admin', 'admin_bidang', 'pimpinan', 'staf'])
                ->default('staf');

            $table->string('no_hp', 20)->nullable();
            $table->boolean('status_aktif')->default(true);

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
