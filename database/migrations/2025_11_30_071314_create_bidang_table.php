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
        Schema::create('bidang', function (Blueprint $table) {
            $table->id();
            $table->string('nama_bidang'); // Contoh: "Bidang Anggaran"
            $table->string('kode', 10)->nullable(); // Contoh: "ANG"
            $table->timestamps();
        });
        // Opsional: Setelah tabel bidang jadi, kita sambungkan Foreign Key user ke sini
        // Ini dilakukan di sini agar tidak error urutan migrasi
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('id_bidang')->references('id')->on('bidang')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bidang');
    }
};
