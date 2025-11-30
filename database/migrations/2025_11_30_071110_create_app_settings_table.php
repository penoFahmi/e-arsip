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
        $table->string('key')->unique();
        $table->text('value')->nullable();
        $table->timestamps();
        });

        // Opsional: Langsung isi default data agar tidak error saat pertama run
        DB::table('app_settings')->insert([
            ['key' => 'app_name', 'value' => 'Sistem Surat BKAD'],
            ['key' => 'app_logo', 'value' => 'default_logo.png'],
            ['key' => 'instansi_address', 'value' => 'Jl. Jenderal Sudirman No. 1'],
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
