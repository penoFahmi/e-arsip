import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Toaster, toast } from 'sonner';
import { type ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success('Berhasil!', {
                description: flash.success,
                duration: 4000,
            });
        }
        if (flash.error) {
            toast.error('Gagal!', {
                description: flash.error,
                duration: 5000,
            });
        }
    }, [flash]);

    return (
        <>
            <Toaster position="top-right" richColors closeButton />

            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
