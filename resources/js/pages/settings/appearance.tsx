import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

// Ubah breadcrumb ke Bahasa Indonesia
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Tampilan',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Tampilan" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Pengaturan Tampilan"
                        description="Sesuaikan tema (gelap/terang) aplikasi sesuai kenyamanan Anda."
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
