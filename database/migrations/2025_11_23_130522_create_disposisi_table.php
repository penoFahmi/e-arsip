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
            $table->id(); // id_disposisi
            $table->foreignId('id_surat')
                ->constrained('surat_masuk')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('dari_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('ke_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->date('tgl_disposisi');
            $table->text('instruksi')->nullable();
            $table->date('batas_waktu')->nullable();
            $table->enum('status_disposisi', ['terkirim', 'dibaca', 'diproses', 'selesai'])
                ->default('terkirim');
            $table->text('catatan')->nullable();
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
