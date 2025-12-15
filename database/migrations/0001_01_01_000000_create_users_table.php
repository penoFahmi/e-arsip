<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Identitas Login
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password');

            // Struktur Organisasi
            // Relasi ke tabel bidang (Unit Kerja) - Foreign Key didefinisikan di migrasi bidang
            $table->unsignedBigInteger('id_bidang')->nullable()->index();

            // Jabatan Teks (Untuk tampilan di PDF Disposisi, misal: "Plt. Kepala Badan")
            $table->string('jabatan')->nullable();

            // ROLE SISTEM (GENERIC / UMUM)
            // super_admin : IT / Admin Utama (Bisa segalanya)
            // level_1     : Pimpinan Tertinggi (Kepala Dinas / Kaban / Camat)
            // level_2     : Eselon 3 (Sekretaris / Kabid / Sekcam)
            // level_3     : Eselon 4 (Kasubbag / Kasubbid / Kasi)
            // staf        : Pelaksana / Admin Bidang
            $table->enum('role', [
                'super_admin',
                'level_1',
                'level_2',
                'level_3',
                'staf'
            ])->default('staf');

            $table->string('no_hp', 20)->nullable();
            $table->boolean('status_aktif')->default(true);

            // Kolom bawaan Laravel
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Tabel bawaan Laravel (Password Reset & Sessions) - Biarkan default
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

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
