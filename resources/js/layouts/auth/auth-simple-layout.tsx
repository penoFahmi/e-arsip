import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Container Header Login - Pastikan items-center untuk Rata Tengah */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md">
                                {/* Logo Icon dibuat lebih besar sedikit di halaman login */}
                                <AppLogoIcon className="size-10 fill-current text-primary" />
                            </div>
                            {/* Judul Aplikasi (Opsional jika ingin ditampilkan di bawah logo) */}
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {/* Form Login */}
                    {children}
                </div>
            </div>
        </div>
    );
}
