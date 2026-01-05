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
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\SuratKeluarController;
use App\Http\Controllers\AgendaController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::name('setup.email.')->group(function () {
        Route::get('/setup-email', [SetupController::class, 'show'])->name('show');
        Route::put('/setup-email', [SetupController::class, 'update'])->name('update');
    });

    Route::get('/surat-masuk/{suratMasuk}/cetak-disposisi', [LaporanController::class, 'cetakDisposisi'])->name('surat.print_disposisi');
    Route::get('/laporan/surat-masuk', [LaporanController::class, 'indexMasuk'])->name('laporan.masuk');
    Route::get('/laporan/surat-masuk/cetak', [LaporanController::class, 'cetakMasuk']);

    Route::get('/laporan/surat-keluar', [LaporanController::class, 'indexKeluar'])->name('laporan.keluar');
    Route::get('/laporan/surat-keluar/cetak', [LaporanController::class, 'cetakKeluar']);
    Route::get('/api/users/bawahan', [UserController::class, 'getBawahan']);

    Route::middleware([ForceChangeDefaultEmail::class])->group(function () {


        Route::middleware(['verified'])->group(function () {

            Route::resource('/dashboard', DashboardController::class);
            require __DIR__ . '/settings.php';
            Route::resource('users', UserController::class);
            Route::resource('bidang', BidangController::class);
            Route::resource('surat-masuk', SuratMasukController::class);
            Route::resource('surat-keluar', SuratKeluarController::class);
            Route::post('/surat-keluar/{suratKeluar}/upload-bukti', [SuratKeluarController::class, 'uploadBukti'])
                ->name('surat-keluar.upload-bukti');
            Route::get('/disposisi/outgoing', [DisposisiController::class, 'outgoing'])->name('disposisi.outgoing');
            Route::get('/disposisi/export', [DisposisiController::class, 'export'])->name('disposisi.export');
            Route::resource('disposisi', DisposisiController::class);
            Route::get('/disposisi/{disposisi}/show', [DisposisiController::class, 'show'])->name('disposisi.show');
            Route::get('/settings/app', [AppSettingController::class, 'index'])->name('settings.app');
            Route::post('/settings/app', [AppSettingController::class, 'update'])->name('settings.app.update');
            Route::get('/settings/disposisi', [AppSettingController::class, 'editDisposisi'])->name('settings.disposisi');
            Route::post('/settings/disposisi', [AppSettingController::class, 'updateDisposisi']);

            Route::get('/agenda', [AgendaController::class, 'index'])->name('agenda.index');
            Route::post('/agenda', [AgendaController::class, 'store'])->name('agenda.store');
            Route::put('/agenda/{agenda}', [AgendaController::class, 'update'])->name('agenda.update');
            Route::delete('/agenda/{agenda}', [AgendaController::class, 'destroy'])->name('agenda.destroy');

            Route::get('/agenda/kalender', [AgendaController::class, 'calendarPage'])->name('agenda.calendar.page');
            Route::get('/api/agenda/events', [AgendaController::class, 'calendarData'])->name('agenda.api.events');
        });
    });
});
