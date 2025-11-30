import { FormEventHandler, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';

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
            // Buat preview URL lokal
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Gunakan POST untuk upload file (Inertia otomatis handle FormData)
        post(route('settings.app.update'), {
            forceFormData: true, // Wajib true jika ada file
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

            <div className="max-w-4xl mx-auto p-6 space-y-6">

                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Identitas Aplikasi</h2>
                    <p className="text-sm text-gray-500">Sesuaikan nama dan logo aplikasi sesuai instansi Anda.</p>
                </div>

                {/* Flash Message */}
                {flash.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" /> {flash.success}
                    </div>
                )}

                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-6 space-y-6">

                        {/* SECTION 1: LOGO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Instansi</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-40 relative overflow-hidden group">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Preview Logo"
                                            className="h-full w-auto object-contain z-10"
                                        />
                                    ) : (
                                        <ImageIcon className="h-10 w-10 text-gray-300" />
                                    )}

                                    {/* Overlay Upload */}
                                    <label htmlFor="logo-upload" className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center cursor-pointer transition-all">
                                        <span className="bg-white text-gray-700 px-3 py-1 rounded shadow text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <Upload className="h-3 w-3" /> Ganti
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
                                <p className="text-[10px] text-gray-400 mt-2 text-center">Format: PNG/JPG, Max 2MB.</p>
                                <InputError message={errors.app_logo} className="mt-1" />
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="app_name">Nama Aplikasi</Label>
                                    <Input
                                        id="app_name"
                                        value={data.app_name}
                                        onChange={e => setData('app_name', e.target.value)}
                                        placeholder="Contoh: E-Arsip Surat"
                                    />
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
                                    <Label htmlFor="app_description">Deskripsi Singkat (Footer)</Label>
                                    <Input
                                        id="app_description"
                                        value={data.app_description}
                                        onChange={e => setData('app_description', e.target.value)}
                                        placeholder="Sistem Informasi Manajemen..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
