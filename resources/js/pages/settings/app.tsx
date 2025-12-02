import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { CheckCircle, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface SettingsProps extends PageProps {
    settings: {
        app_name?: string;
        instansi_name?: string;
        app_description?: string;
        app_logo?: string;
    };
    flash: { success?: string; error?: string };
}

export default function AppSettings({ settings, flash }: SettingsProps) {
    // State untuk preview logo sebelum upload
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.app_logo ? `/storage/${settings.app_logo}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || '',
        instansi_name: settings.instansi_name || '',
        app_description: settings.app_description || '',
        app_logo: null as File | null, // Untuk file upload
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('app_logo', file);
            // Buat preview URL lokal agar user bisa lihat gambarnya
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // PERBAIKAN: Gunakan string URL manual '/settings/app'
        // Agar tidak error "route is not defined"
        post('/settings/app', {
            forceFormData: true, // Wajib true karena ada upload file
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengaturan Aplikasi', href: '/settings/app' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Aplikasi" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Header Page */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Identitas Aplikasi</h2>
                    <p className="text-sm text-gray-500">Sesuaikan nama, deskripsi, dan logo instansi Anda.</p>
                </div>

                {/* Flash Message */}
                {(flash?.success || flash?.error) && (
                    <div className={`p-4 rounded-lg border flex items-center gap-2 text-sm ${
                        flash.success
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {flash.success ? <CheckCircle className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                        {flash.success || flash.error}
                    </div>
                )}

                <div className="bg-white border rounded-xl shadow-sm overflow-hidden max-w-4xl">
                    <form onSubmit={submit} className="p-6 space-y-8">

                        {/* SECTION 1: LOGO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Instansi</label>

                                {/* Area Upload Logo */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-48 relative overflow-hidden group hover:border-black transition-colors">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Preview Logo"
                                            className="h-full w-auto object-contain z-10 p-2"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <span className="text-xs">Belum ada logo</span>
                                        </div>
                                    )}

                                    {/* Overlay Upload (Muncul saat hover) */}
                                    <label htmlFor="logo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <span className="bg-white text-gray-800 px-3 py-1.5 rounded-full shadow text-xs font-semibold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <Upload className="h-3 w-3" /> Ganti Logo
                                        </span>
                                    </label>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 text-center">Format: PNG/JPG/JPEG. Maks 2MB.</p>
                                <InputError message={errors.app_logo} className="mt-1" />
                            </div>

                            {/* SECTION 2: TEKS FORM */}
                            <div className="md:col-span-2 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="app_name">Nama Aplikasi</Label>
                                    <Input
                                        id="app_name"
                                        value={data.app_name}
                                        onChange={e => setData('app_name', e.target.value)}
                                        placeholder="Contoh: E-Arsip Surat"
                                        className="font-medium"
                                    />
                                    <p className="text-[10px] text-gray-500">Akan muncul di tab browser dan header sidebar.</p>
                                    <InputError message={errors.app_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instansi_name">Nama Instansi</Label>
                                    <Input
                                        id="instansi_name"
                                        value={data.instansi_name}
                                        onChange={e => setData('instansi_name', e.target.value)}
                                        placeholder="Contoh: Badan Keuangan Daerah"
                                    />
                                    <InputError message={errors.instansi_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="app_description">Deskripsi Singkat</Label>
                                    <Input
                                        id="app_description"
                                        value={data.app_description}
                                        onChange={e => setData('app_description', e.target.value)}
                                        placeholder="Sistem Informasi Manajemen..."
                                    />
                                    <p className="text-[10px] text-gray-500">Muncul di halaman login atau footer.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={processing} className="min-w-[150px]">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
