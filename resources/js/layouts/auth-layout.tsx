import AppLogoIcon from '@/components/app-logo-icon';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { SharedData } from '@/types';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { app_config } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-md space-y-8">

                <div className="flex flex-col items-center gap-2 text-center">
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            {app_config?.logo ? (
                                <img src={app_config.logo} alt="Logo" className="h-10 w-10 object-contain" />
                            ) : (
                                <AppLogoIcon className="size-8 fill-current" />
                            )}
                        </div>
                        <div className="space-y-1">
                             <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {app_config?.name || 'Sistem Surat'}
                             </h1>
                             <p className="text-sm text-muted-foreground font-medium">
                                {app_config?.instansi || 'BKAD Pontianak'}
                             </p>
                        </div>
                    </Link>
                </div>

                <div className="flex flex-col gap-6 rounded-xl bg-card text-card-foreground p-6 shadow-sm border border-border">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h2 className="text-xl font-semibold">{title}</h2>
                        <p className="text-sm text-muted-foreground text-center">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>

            </div>
        </div>
    );
}
