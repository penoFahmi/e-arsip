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
        Schema::create('file_scan', function (Blueprint $table) {
            $table->id(); // id_file
            $table->foreignId('id_surat')
                ->constrained('surat_masuk')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('nama_file');
            $table->string('path_file');
            $table->string('tipe_file', 20)->default('pdf');
            $table->unsignedBigInteger('ukuran_file')->nullable(); // dalam byte
            $table->timestamp('tgl_upload')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_scan');
    }
};
