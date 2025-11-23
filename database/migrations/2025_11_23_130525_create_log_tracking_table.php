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
        Schema::create('log_tracking', function (Blueprint $table) {
            $table->id(); // id_log
            $table->foreignId('id_surat')
                ->constrained('surat_masuk')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('id_user')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('aksi', 50); // input, disposisi, baca, selesai, arsip, dll
            $table->timestamp('waktu_aksi')->useCurrent();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_tracking');
    }
};
