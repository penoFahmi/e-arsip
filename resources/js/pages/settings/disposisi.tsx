import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Props berisi data setting yang sudah tersimpan sebelumnya
interface Props {
    settings: Record<string, string>;
}

export default function DisposisiSettings({ settings }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        // Default value diambil dari DB, kalau kosong pakai default text
        instansi_nama: settings.instansi_nama || 'PEMERINTAH KOTA PONTIANAK',
        instansi_alamat: settings.instansi_alamat || 'Jalan ...',

        // LABEL JABATAN (Ini yang bikin dinamis)
        // Level 1: Penerima surat pertama kali (biasanya Kasubbag Umum / Sekretaris)
        label_level_1: settings.label_level_1 || 'Sekretaris/Kasubbag Umum',

        // Level 2: Pimpinan Tertinggi (Kepala Dinas / Kaban / Camat)
        label_level_2: settings.label_level_2 || 'Kepala Badan',

        // Level 3: Pejabat Eselon 3 (Kabid / Sekcam)
        label_level_3: settings.label_level_3 || 'Sekretaris/Kepala Bidang',

        // Level 4: Pejabat Eselon 4 (Kasi / Kasubbid)
        label_level_4: settings.label_level_4 || 'Kasubbag/Kasubbid',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/disposisi');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan', href: '#' }, { title: 'Label Disposisi', href: '#' }]}>
            <Head title="Pengaturan Disposisi" />

            <div className="p-6 max-w-4xl mx-auto">
                <form onSubmit={submit} className="space-y-6">

                    {/* 1. Pengaturan KOP SURAT */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kop Surat & Identitas</CardTitle>
                            <CardDescription>Data ini akan muncul di bagian atas PDF.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Instansi</Label>
                                <Input value={data.instansi_nama} onChange={e => setData('instansi_nama', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat Lengkap</Label>
                                <Input value={data.instansi_alamat} onChange={e => setData('instansi_alamat', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Pengaturan LABEL JABATAN (Dinamis) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Struktur Hirarki Disposisi</CardTitle>
                            <CardDescription>
                                Sesuaikan nama jabatan sesuai struktur organisasi instansi Anda.
                                <br />Label ini yang akan muncul di kolom Lembar Disposisi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Label className="font-bold text-blue-600">Level 1 (Pintu Masuk)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Biasanya: Kasubbag Umum / Sekretaris</p>
                                    <Input value={data.label_level_1} onChange={e => setData('label_level_1', e.target.value)} />
                                </div>

                                <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Label className="font-bold text-blue-600">Level 2 (Pimpinan Tertinggi)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Biasanya: Kepala Dinas / Kaban / Camat</p>
                                    <Input value={data.label_level_2} onChange={e => setData('label_level_2', e.target.value)} />
                                </div>

                                <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Label className="font-bold text-blue-600">Level 3 (Bidang/Bagian)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Biasanya: Kabid / Sekcam</p>
                                    <Input value={data.label_level_3} onChange={e => setData('label_level_3', e.target.value)} />
                                </div>

                                <div className="space-y-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Label className="font-bold text-blue-600">Level 4 (Seksi/Subbid)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Biasanya: Kasi / Kasubbid</p>
                                    <Input value={data.label_level_4} onChange={e => setData('label_level_4', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                        {recentlySuccessful && <span className="text-sm text-green-600">Berhasil disimpan!</span>}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
