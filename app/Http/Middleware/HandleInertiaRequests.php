<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    // public function share(Request $request): array
    // {
    //     [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    //     return [
    //         ...parent::share($request),
    //         'name' => config('app.name'),
    //         'quote' => ['message' => trim($message), 'author' => trim($author)],
    //         'auth' => [
    //             'user' => $request->user(),
    //         ],
    //         'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
    //     ];
    // }

    public function share(Request $request): array
    {
        // 1. AMBIL PENGATURAN APLIKASI (Cached biar ringan)
        // Kita ambil semua setting dan ubah jadi format Key-Value array
        $settings = cache()->remember('app_settings_global', 3600, function () {
            return DB::table('app_settings')->pluck('value', 'key')->toArray();
        });

        // 2. LOGIC URL LOGO
        $logoUrl = isset($settings['app_logo']) && $settings['app_logo']
            ? Storage::url($settings['app_logo'])
            : '/images/default-logo.png'; // Pastikan ada file ini di public/images/

        return array_merge(parent::share($request), [

            // Data User Login
            'auth' => [
                'user' => $request->user() ? $request->user()->load('bidang') : null,
            ],

            // Data Aplikasi (White-label)
            'app_config' => [
                'name' => $settings['app_name'] ?? 'E-Arsip Surat',
                'desc' => $settings['app_description'] ?? 'Sistem Manajemen Surat',
                'logo' => $logoUrl,
                'instansi' => $settings['instansi_name'] ?? 'Pemerintah Daerah',
            ],

            // Flash Message (Untuk notifikasi sukses/gagal)
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
