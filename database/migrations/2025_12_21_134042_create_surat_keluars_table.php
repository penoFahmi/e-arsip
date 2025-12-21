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
        Schema::create('surat_keluar', function (Blueprint $table) {
            $table->id();
            $table->string('no_agenda')->unique();
            $table->string('kode_klasifikasi')->nullable();
            $table->string('no_surat')->nullable();
            $table->date('tgl_surat');
            $table->string('tujuan');
            $table->string('perihal');
            $table->text('ringkasan')->nullable();
            $table->enum('sifat_surat', ['biasa', 'penting', 'rahasia'])->default('biasa');
            $table->enum('status_surat', ['draft', 'kirim', 'diterima'])->default('draft');
            $table->string('file_surat')->nullable();
            $table->string('file_bukti')->nullable();
            $table->foreignId('id_user_input')->constrained('users');
            $table->foreignId('id_bidang')->nullable()->constrained('bidang');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_keluars');
    }
};
