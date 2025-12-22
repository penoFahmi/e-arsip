import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { app_config } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
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
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">
                    {app_config?.name || 'Sistem Surat'}
                </span>
                <span className="truncate text-xs text-muted-foreground font-normal">
                    {app_config?.instansi || 'BKAD Pontianak'}
                </span>
            </div>
        </>
    );
}
