<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\SetupController;
use App\Http\Middleware\ForceChangeDefaultEmail;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BidangController;
use App\Http\Controllers\SuratMasukController;
use App\Http\Controllers\AppSettingController;
use App\Http\Controllers\DisposisiController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// GROUP 1: User yang sudah Login (Middleware 'auth')
Route::middleware(['auth'])->group(function () {

    Route::name('setup.email.')->group(function () {
        Route::get('/setup-email', [SetupController::class, 'show'])->name('show');
        Route::put('/setup-email', [SetupController::class, 'update'])->name('update');
    });

    Route::middleware([ForceChangeDefaultEmail::class])->group(function () {


        Route::middleware(['verified'])->group(function () {

            Route::get('/dashboard', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');

            // Agar settings juga terlindungi, tidak bisa diakses sembarangan
            require __DIR__ . '/settings.php';

            // Nanti route surat_masuk, disposisi, dll taruh sini juga
            Route::resource('users', UserController::class);
            Route::resource('bidang', BidangController::class);
            Route::resource('surat-masuk', SuratMasukController::class);
            Route::resource('disposisi', DisposisiController::class);
            Route::get('/settings/app', [AppSettingController::class, 'index'])->name('settings.app');
            Route::post('/settings/app', [AppSettingController::class, 'update'])->name('settings.app.update');
        });
    });
});
