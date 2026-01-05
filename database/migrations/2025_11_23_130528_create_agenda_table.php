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
        Schema::create('agenda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_surat')
                ->nullable()
                ->constrained('surat_masuk')
                ->nullOnDelete();

            $table->foreignId('id_bidang')
                ->nullable()
                ->constrained('bidang');

            $table->string('judul_agenda');
            $table->text('deskripsi')->nullable();
            $table->string('lokasi')->nullable();

            $table->date('tgl_mulai');
            $table->date('tgl_selesai')->nullable();
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('warna_label')->default('#3b82f6');
            $table->foreignId('penanggung_jawab')
                ->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agenda');
    }
};
