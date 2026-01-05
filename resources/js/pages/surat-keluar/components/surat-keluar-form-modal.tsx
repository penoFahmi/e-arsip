import { useEffect, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, FileText, Upload } from 'lucide-react';
import { SuratKeluarData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: SuratKeluarData | null;
}

export default function SuratKeluarFormModal({ isOpen, onClose, editingData }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        tgl_surat: new Date().toISOString().split('T')[0],
        kode_klasifikasi: '',
        tujuan: '',
        perihal: '',
        sifat_surat: 'biasa',
        no_surat: '', // Kolom ini dibuka sejak awal
        status_surat: 'diterima', // Default langsung "Diterima/Selesai" karena surat sudah jadi
        file_surat: null as File | null,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    tgl_surat: editingData.tgl_surat,
                    kode_klasifikasi: editingData.kode_klasifikasi || '',
                    tujuan: editingData.tujuan,
                    perihal: editingData.perihal,
                    sifat_surat: editingData.sifat_surat,
                    no_surat: editingData.no_surat || '',
                    status_surat: editingData.status_surat,
                    file_surat: null,
                });
            } else {
                reset();
                // Default tanggal hari ini
                setData('tgl_surat', new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, editingData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Gunakan post dengan forceFormData agar file terkirim
        const options = {
            onSuccess: onClose,
            forceFormData: true
        };

        if (editingData) {
            // Khusus Inertia kalau upload file di PUT harus pakai trik _method: put
            router.post(`/surat-keluar/${editingData.id}`, { _method: 'put', ...data }, options);
        } else {
            post('/surat-keluar', options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-orange-500" />
                        {editingData ? 'Edit Arsip Surat Keluar' : 'Input Arsip Surat Keluar'}
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan data surat yang sudah selesai dibuat/dikirim untuk pengarsipan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 py-4">

                    {/* DATA UTAMA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Tanggal Surat</Label>
                            <Input type="date" value={data.tgl_surat} onChange={e => setData('tgl_surat', e.target.value)} required />
                            <InputError message={errors.tgl_surat} />
                        </div>

                        <div className="space-y-1">
                            <Label>Nomor Surat (Definitif)</Label>
                            <Input
                                placeholder="Nomor Surat Lengkap (Contoh: 800/123/BKAD)"
                                value={data.no_surat}
                                onChange={e => setData('no_surat', e.target.value)}
                                required // Wajib diisi karena surat sudah jadi
                            />
                            <InputError message={errors.no_surat} />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <Label>Tujuan Surat (Kepada Yth)</Label>
                            <Input placeholder="Nama Instansi / Perorangan" value={data.tujuan} onChange={e => setData('tujuan', e.target.value)} required />
                            <InputError message={errors.tujuan} />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <Label>Perihal / Isi Ringkas</Label>
                            <Textarea placeholder="Inti isi surat..." value={data.perihal} onChange={e => setData('perihal', e.target.value)} required />
                            <InputError message={errors.perihal} />
                        </div>

                        <div className="space-y-1">
                            <Label>Kode Klasifikasi (Opsional)</Label>
                            <Input placeholder="Contoh: 005" value={data.kode_klasifikasi} onChange={e => setData('kode_klasifikasi', e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <Label>Sifat Surat</Label>
                            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                value={data.sifat_surat} onChange={e => setData('sifat_surat', e.target.value as any)}>
                                <option value="biasa">Biasa</option>
                                <option value="penting">Penting</option>
                                <option value="rahasia">Rahasia</option>
                            </select>
                        </div>
                    </div>

                    {/* FILE UPLOAD SEKARANG LANGSUNG MUNCUL */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                        <Label className="flex items-center gap-2">
                            <Upload className="h-4 w-4" /> Upload Scan Surat (PDF/JPG)
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={e => setData('file_surat', e.target.files?.[0] || null)}
                            className="bg-white"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Upload file surat asli yang sudah bertanda tangan & stempel.
                        </p>

                        {editingData?.file_surat && !data.file_surat && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <FileText className="h-3 w-3" /> File arsip sudah ada sebelumnya.
                            </p>
                        )}
                        <InputError message={errors.file_surat} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">
                            {editingData ? 'Simpan Perubahan' : 'Simpan Arsip'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
