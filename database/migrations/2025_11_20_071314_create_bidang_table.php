<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bidang', function (Blueprint $table) {
            $table->id();

            // Nama Unit Kerja (Contoh: "Sekretariat", "Bidang Anggaran", "Seksi Trantib")
            $table->string('nama_bidang');

            // Kode Singkatan (Contoh: "SEK", "ANG", "TRANTIB")
            $table->string('kode', 20)->nullable();

            // [KUNCI FLEKSIBILITAS HIRARKI]
            // NULL = Level Teratas (Bisa Sekretariat / Bidang)
            // ADA ISI = Sub-Unit (Anak dari parent_id)
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('bidang')
                ->nullOnDelete();

            // Level urutan hirarki (opsional, untuk sorting tampilan)
            $table->integer('urutan')->default(1);

            $table->timestamps();
        });

        // Relasi User ke Bidang (Disimpan disini agar urutan migrate aman)
        Schema::table('users', function (Blueprint $table) {
            // Hapus foreign key lama jika ada (untuk safety saat refresh)
            // $table->dropForeign(['id_bidang']);

            $table->foreign('id_bidang')->references('id')->on('bidang')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_bidang']);
        });
        Schema::dropIfExists('bidang');
    }
};
