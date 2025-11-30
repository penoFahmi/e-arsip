<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SetupController;
use App\Http\Middleware\ForceChangeDefaultEmail;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AppSettingController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// GROUP 1: User yang sudah Login (Middleware 'auth')
Route::middleware(['auth'])->group(function () {

    // A. RUTE SETUP (Ganti Email Paksa)
    // Rute ini BEBAS dari middleware ForceChangeDefaultEmail
    // Agar user bisa akses form untuk mengganti emailnya
    Route::name('setup.email.')->group(function () {
        Route::get('/setup-email', [SetupController::class, 'show'])->name('show');
        Route::put('/setup-email', [SetupController::class, 'update'])->name('update');
    });

    // B. RUTE APLIKASI UTAMA (Dipagari Satpam Email Default)
    // User dengan email 'admin@setup.app' MENTAL dari sini
    Route::middleware([ForceChangeDefaultEmail::class])->group(function () {

        // C. RUTE YANG BUTUH VERIFIKASI EMAIL (Dashboard, Settings, Surat)
        // User yang belum klik link di email MENTAL dari sini
        Route::middleware(['verified'])->group(function () {

            Route::get('/dashboard', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');

            // --- MASUKKAN ROUTE SETTINGS DI SINI ---
            // Agar settings juga terlindungi, tidak bisa diakses sembarangan
            require __DIR__.'/settings.php';

            // Nanti route surat_masuk, disposisi, dll taruh sini juga
            Route::resource('users', UserController::class);
            Route::resource('settings/app', AppSettingController::class);
            

        });

    });

});
