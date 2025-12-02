<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Contoh: 'app_name', 'app_logo'
            $table->text('value')->nullable(); // Isi setting (bisa teks panjang atau path gambar)
            $table->timestamps();
        });

        // Optional: Isi Data Default agar tidak kosong saat pertama kali
        DB::table('app_settings')->insert([
            [
                'key' => 'app_name',
                'value' => 'Sistem E-Arsip',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'instansi_name',
                'value' => 'Pemerintah Daerah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'app_description',
                'value' => 'Aplikasi Manajemen Surat Menyurat',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'app_logo',
                'value' => null, // Logo default null (nanti dihandle frontend pakai gambar bawaan)
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
