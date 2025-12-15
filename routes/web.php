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
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DisposisiController;
use App\Http\Controllers\ReportController;

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
    Route::get('/surat-masuk/{suratMasuk}/cetak-disposisi', [ReportController::class, 'printDisposisi'])->name('surat.print_disposisi');
    Route::get('/laporan/agenda-surat-masuk', [ReportController::class, 'printAgenda'])->name('laporan.agenda');


    Route::middleware([ForceChangeDefaultEmail::class])->group(function () {


        Route::middleware(['verified'])->group(function () {

            Route::resource('/dashboard', DashboardController::class);
            require __DIR__ . '/settings.php';
            Route::resource('users', UserController::class);
            Route::resource('bidang', BidangController::class);
            Route::resource('surat-masuk', SuratMasukController::class);
            Route::resource('disposisi', DisposisiController::class);
            Route::get('/settings/app', [AppSettingController::class, 'index'])->name('settings.app');
            Route::post('/settings/app', [AppSettingController::class, 'update'])->name('settings.app.update');
            // 2. Pengaturan Disposisi (Label Jabatan) - YANG BARU KITA BUAT
            Route::get('/settings/disposisi', [AppSettingController::class, 'editDisposisi'])->name('settings.disposisi');
            Route::post('/settings/disposisi', [AppSettingController::class, 'updateDisposisi']);
        });
    });
});
