import { useState, FormEventHandler } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search, Pencil, Trash2, Eye, FileText, Calendar, Paperclip, Send } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface UserLite {
    id: number;
    name: string;
    jabatan: string;
    id_bidang: number;
}
interface FileScan {
    id: number;
    nama_file: string;
    path_file: string;
}

interface SuratData {
    id: number;
    no_surat: string;
    tgl_surat: string;
    tgl_terima: string;
    pengirim: string;
    perihal: string;
    ringkasan?: string;
    sifat_surat: 'biasa' | 'penting' | 'rahasia';
    media: 'fisik' | 'digital';
    file_scan?: FileScan[];
}

interface Props extends PageProps {
    surats: { data: SuratData[]; links: any[] };
    users: UserLite[];
    filters: { search: string };
}

export default function SuratMasukIndex({ surats, users, filters }: Props) {
    // State untuk modal input/edit surat
    const [isSuratModalOpen, setisSuratModalOpen] = useState(false);
    const [editingSurat, setEditingSurat] = useState<SuratData | null>(null);
    // State untuk pencarian
    const [search, setSearch] = useState(filters.search || '');
    //State disposisi
    const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState(false);
    const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<SuratData | null>(null);

    const suratForm= useForm({
        no_surat: '',
        tgl_surat: '',
        tgl_terima: new Date().toISOString().split('T')[0],
        pengirim: '',
        perihal: '',
        ringkasan: '',
        sifat_surat: 'biasa',
        media: 'fisik',
        file_scan: null as File | null,
    });

    const disposisiForm = useForm({
        id_surat: '',
        ke_user_id: '',
        instruksi: '',
        batas_waktu: '',
        catatan: '',
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/surat-masuk', { search }, { preserveState: true });
        }
    };

    const openCreateSurat = () => {
        setEditingSurat(null);
        suratForm.reset();
        suratForm.clearErrors();
        setisSuratModalOpen(true);
    };

    const openEditSurat = (surat: SuratData) => {
        setEditingSurat(surat);
        suratForm.setData({
            no_surat: surat.no_surat,
            tgl_surat: surat.tgl_surat,
            tgl_terima: surat.tgl_terima,
            pengirim: surat.pengirim,
            perihal: surat.perihal,
            ringkasan: surat.ringkasan || '',
            sifat_surat: surat.sifat_surat as any,
            media: surat.media as any,
            file_scan: null, // Reset input file agar user upload ulang jika mau
        });
        suratForm.clearErrors();
        setisSuratModalOpen(true);
    };

    const submitSurat: FormEventHandler = (e) => {
        e.preventDefault();
        // ForceFormData penting untuk upload file
        const options = { onSuccess: () => setisSuratModalOpen(false), forceFormData: true };

        if (editingSurat) {
            // PENTING: Untuk update file di Laravel/Inertia, gunakan POST dengan _method: 'put'
            router.post(`/surat-masuk/${editingSurat.id}`, {
                _method: 'put',
                ...suratForm.data,
                // file_scan akan otomatis terkirim jika ada isinya
            }, options);
        } else {
            suratForm.post('/surat-masuk', options);
        }
    };

    const deleteSurat = (id: number) => {
        if (confirm('Yakin hapus surat ini? File scan fisik juga akan dihapus permanen dari server.')) {
            router.delete(`/surat-masuk/${id}`);
        }
    };

    const openDisposisi = (surat: SuratData) => {
        setSelectedSuratForDisposisi(surat);
        disposisiForm.reset();
        disposisiForm.setData('id_surat', String(surat.id));
        disposisiForm.clearErrors();
        setIsDisposisiModalOpen(true);
    };

    const submitDisposisi: FormEventHandler = (e) => {
        e.preventDefault();
        disposisiForm.post('/disposisi', {
            onSuccess: () => setIsDisposisiModalOpen(false),
        });
    };

    const getBadgeColor = (sifat: string) => {
        if (sifat === 'rahasia') return 'destructive';
        if (sifat === 'penting') return 'default';
        return 'secondary';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Surat Masuk', href: '/surat-masuk' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Masuk" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Agenda Surat Masuk</h2>
                        <p className="text-sm text-muted-foreground">Catat dan kelola surat yang masuk.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari No / Perihal..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreateSurat}>
                            <Plus className="h-4 w-4 mr-2" /> Input Surat
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Info Surat</th>
                                <th className="px-6 py-3 font-medium">Asal & Perihal</th>
                                <th className="px-6 py-3 font-medium">Sifat</th>
                                <th className="px-6 py-3 font-medium text-center">File</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {surats.data.map((surat) => (
                                <tr key={surat.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-semibold text-foreground">{surat.no_surat}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" /> {surat.tgl_surat}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top max-w-xs">
                                        <div className="text-foreground font-medium">{surat.pengirim}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{surat.perihal}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <Badge variant={getBadgeColor(surat.sifat_surat)} className="capitalize">
                                            {surat.sifat_surat}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 align-top text-center">
                                        {surat.file_scan && surat.file_scan.length > 0 ? (
                                            <a
                                                href={`/storage/${surat.file_scan[0].path_file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                title="Lihat File"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openDisposisi(surat)} title="Disposisi Surat Ini">
                                                <Send className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEditSurat(surat)}>
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteSurat(surat.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {surats.data.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">Belum ada surat masuk.</div>
                    )}
                </div>
            </div>

            {/* Modal Surat Masuk */}
            <Dialog open={isSuratModalOpen} onOpenChange={setisSuratModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSurat ? 'Edit Surat' : 'Input Surat Masuk'}</DialogTitle>
                        <DialogDescription>
                            Isi metadata surat dan upload file scan (PDF/Gambar).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSurat} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="no_surat">Nomor Surat</Label>
                                <Input id="no_surat" value={suratForm.data.no_surat} onChange={e => suratForm.setData('no_surat', e.target.value)} required placeholder="Misal: 400.1/123/SETDA" />
                                <InputError message={suratForm.errors.no_surat} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="pengirim">Pengirim / Asal Surat</Label>
                                <Input id="pengirim" value={suratForm.data.pengirim} onChange={e => suratForm.setData('pengirim', e.target.value)} required placeholder="Misal: Dinas Kesehatan" />
                                <InputError message={suratForm.errors.pengirim} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label>Tgl. Surat</Label>
                                    <Input type="date" value={suratForm.data.tgl_surat} onChange={e => suratForm.setData('tgl_surat', e.target.value)} required />
                                    <InputError message={suratForm.errors.tgl_surat} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Tgl. Diterima</Label>
                                    <Input type="date" value={suratForm.data.tgl_terima} onChange={e => suratForm.setData('tgl_terima', e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="perihal">Perihal</Label>
                                <Input id="perihal" value={suratForm.data.perihal} onChange={e => suratForm.setData('perihal', e.target.value)} required placeholder="Inti isi surat..." />
                                <InputError message={suratForm.errors.perihal} />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label>Sifat Surat</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={suratForm.data.sifat_surat}
                                        onChange={e => suratForm.setData('sifat_surat', e.target.value as any)}
                                    >
                                        <option value="biasa">Biasa</option>
                                        <option value="penting">Penting</option>
                                        <option value="rahasia">Rahasia</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Media</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={suratForm.data.media}
                                        onChange={e => suratForm.setData('media', e.target.value as any)}
                                    >
                                        <option value="fisik">Fisik (Kertas)</option>
                                        <option value="digital">Digital (Email)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="file_scan">
                                    Upload File {editingSurat && <span className="text-gray-400 font-normal">(Isi jika ingin mengganti)</span>}
                                </Label>
                                <Input
                                    id="file_scan"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => suratForm.setData('file_scan', e.target.files ? e.target.files[0] : null)}
                                    // PERBAIKAN: Hapus properti disabled di sini agar bisa ganti file saat edit
                                />
                                <p className="text-[10px] text-muted-foreground">PDF/Gambar, Max 10MB.</p>
                                <InputError message={suratForm.errors.file_scan} />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <Label htmlFor="ringkasan">Ringkasan / Catatan Tambahan</Label>
                            <textarea
                                id="ringkasan"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={suratForm.data.ringkasan}
                                onChange={e => suratForm.setData('ringkasan', e.target.value)}
                                placeholder="Isi ringkasan surat di sini..."
                            />
                        </div>

                        <DialogFooter className="col-span-1 md:col-span-2 mt-2">
                            <Button type="button" variant="secondary" onClick={() => setisSuratModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={suratForm.processing}>
                                {suratForm.processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Modal Disposisi Surat */}
            <Dialog open={isDisposisiModalOpen} onOpenChange={setIsDisposisiModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Disposisi Surat</DialogTitle>
                        <DialogDescription>
                            Kirim perintah tindak lanjut untuk surat: <br/>
                            <strong>{selectedSuratForDisposisi?.no_surat}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitDisposisi} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tujuan Disposisi (Pilih Pegawai)</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                value={disposisiForm.data.ke_user_id}
                                onChange={e => disposisiForm.setData('ke_user_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Pegawai --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} {u.jabatan ? `(${u.jabatan})` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={disposisiForm.errors.ke_user_id} />
                        </div>

                        <div className="space-y-2">
                            <Label>Isi Instruksi / Perintah</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                value={disposisiForm.data.instruksi}
                                onChange={e => disposisiForm.setData('instruksi', e.target.value)}
                                placeholder="Contoh: Segera tindak lanjuti dan laporkan."
                                required
                            />
                            <InputError message={disposisiForm.errors.instruksi} />
                        </div>

                        <div className="space-y-2">
                            <Label>Batas Waktu (Opsional)</Label>
                            <Input
                                type="date"
                                value={disposisiForm.data.batas_waktu}
                                onChange={e => disposisiForm.setData('batas_waktu', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Catatan Tambahan</Label>
                            <Input
                                value={disposisiForm.data.catatan}
                                onChange={e => disposisiForm.setData('catatan', e.target.value)}
                                placeholder="Catatan singkat..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsDisposisiModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={disposisiForm.processing} className="bg-blue-600 hover:bg-blue-700">
                                <Send className="h-4 w-4 mr-2" /> Kirim Disposisi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
