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
        Schema::create('surat_masuk', function (Blueprint $table) {
            $table->id(); // id_surat
            $table->string('no_surat')->unique();
            $table->date('tgl_surat')->nullable();
            $table->date('tgl_terima')->nullable();
            $table->string('pengirim');
            $table->string('perihal');
            $table->text('ringkasan')->nullable();
            $table->enum('sifat_surat', ['biasa', 'penting', 'rahasia'])->default('biasa');
            $table->enum('media', ['fisik', 'digital'])->default('fisik');
            $table->foreignId('id_user_input')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->enum('status_surat', ['baru', 'didisposisi', 'selesai', 'arsip'])
                ->default('baru');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_masuk');
    }
};
