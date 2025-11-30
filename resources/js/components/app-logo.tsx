import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    // Ambil data global app_config
    const { app_config } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {/* Logika: Jika ada logo custom, pakai img. Jika tidak, pakai Icon default */}
                {app_config?.logo ? (
                    <img
                        src={app_config.logo}
                        alt="Logo"
                        className="size-full object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {/* Ambil Nama Aplikasi dari DB, fallback ke default */}
                    {app_config?.name || 'Sistem Surat'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                    {app_config?.instansi || 'Pemerintah Daerah'}
                </span>
            </div>
        </>
    );
}
