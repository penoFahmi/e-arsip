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
        Schema::create('disposisi', function (Blueprint $table) {
            $table->id();
            // Link ke Surat
            $table->foreignId('id_surat')
                ->constrained('surat_masuk')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Parent ID untuk Hirarki (Disposisi Berantai)
            // Jika NULL = Disposisi Pertama (misal dari Staf ke Kaban)
            // Jika ADA ISI = Disposisi Turunan (misal dari Kaban ke Kabid)
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('disposisi')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            // Siapa yang menyuruh (Dari)
            $table->foreignId('dari_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Siapa yang disuruh (Ke)
            $table->foreignId('ke_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Sifat Disposisi (Penting untuk warna badge di UI nanti)
            $table->enum('sifat_disposisi', ['biasa', 'segera', 'sangat_segera', 'rahasia'])
                ->default('biasa');

            // Instruksi Spesifik (Text Area untuk tulisan tangan pimpinan)
            // Contoh: "Koordinasikan dengan Bappeda" atau "Hadir mewakili saya"
            $table->text('instruksi')->nullable();

            $table->date('tgl_disposisi');
            $table->date('batas_waktu')->nullable();

            // Status per item disposisi (bukan status surat global)
            $table->enum('status_disposisi', ['terkirim', 'dibaca', 'tindak_lanjut', 'selesai'])
                ->default('terkirim');

            $table->text('catatan')->nullable(); // Catatan tambahan staf saat selesai
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disposisi');
    }
};
