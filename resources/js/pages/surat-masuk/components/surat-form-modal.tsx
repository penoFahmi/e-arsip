import { useEffect, FormEventHandler, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Camera, Upload, FileText, Calendar, Shield } from 'lucide-react';
import { SuratData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: SuratData | null;
}

export default function SuratFormModal({ isOpen, onClose, editingData }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        kode_klasifikasi: '',
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

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    kode_klasifikasi: editingData.kode_klasifikasi || '',
                    no_surat: editingData.no_surat,
                    tgl_surat: editingData.tgl_surat,
                    tgl_terima: editingData.tgl_terima,
                    pengirim: editingData.pengirim,
                    perihal: editingData.perihal,
                    ringkasan: editingData.ringkasan || '',
                    sifat_surat: editingData.sifat_surat as any,
                    media: editingData.media as any,
                    file_scan: null,
                });
            } else {
                reset();
            }
        }
    }, [isOpen, editingData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setData('file_scan', e.target.files[0]);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose, forceFormData: true };

        if (editingData) {
            router.post(`/surat-masuk/${editingData.id}`, { _method: 'put', ...data }, options);
        } else {
            post('/surat-masuk', options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">

                <div className="px-6 py-4 border-b bg-muted/40">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingData ? <FileText className="h-5 w-5 text-blue-600" /> : <Upload className="h-5 w-5 text-blue-600" />}
                            {editingData ? 'Edit Data Surat' : 'Registrasi Surat Masuk'}
                        </DialogTitle>
                        <DialogDescription>
                            Pastikan nomor surat dan tanggal sesuai dengan fisik naskah dinas.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary pb-2 border-b">
                            <FileText className="h-4 w-4" /> Data Naskah Dinas
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1 space-y-1">
                                <Label htmlFor="kode_klasifikasi" className="text-xs">Kode Klasifikasi</Label>
                                <Input
                                    id="kode_klasifikasi"
                                    value={data.kode_klasifikasi}
                                    onChange={e => setData('kode_klasifikasi', e.target.value)}
                                    placeholder="ex: 900"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor="no_surat" className="text-xs">Nomor Surat <span className="text-red-500">*</span></Label>
                                <Input
                                    id="no_surat"
                                    value={data.no_surat}
                                    onChange={e => setData('no_surat', e.target.value)}
                                    placeholder="Nomor tercetak di surat"
                                    required
                                />
                                <InputError message={errors.no_surat} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pengirim" className="text-xs">Asal Surat / Pengirim <span className="text-red-500">*</span></Label>
                            <Input
                                id="pengirim"
                                value={data.pengirim}
                                onChange={e => setData('pengirim', e.target.value)}
                                placeholder="Nama Instansi / Perorangan"
                                required
                            />
                            <InputError message={errors.pengirim} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="perihal" className="text-xs">Perihal / Isi Ringkas <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="perihal"
                                value={data.perihal}
                                onChange={e => setData('perihal', e.target.value)}
                                placeholder="Inti pokok surat..."
                                className="min-h-[80px]"
                                required
                            />
                            <InputError message={errors.perihal} />
                        </div>

                         <div className="space-y-1">
                            <Label htmlFor="tgl_surat" className="text-xs">Tanggal Surat</Label>
                            <Input type="date" value={data.tgl_surat} onChange={e => setData('tgl_surat', e.target.value)} required />
                            <InputError message={errors.tgl_surat} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary pb-2 border-b">
                            <Calendar className="h-4 w-4" /> Penerimaan & File
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Diterima Tanggal <span className="text-red-500">*</span></Label>
                                <Input type="date" value={data.tgl_terima} onChange={e => setData('tgl_terima', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Nomor Agenda</Label>
                                <div className="h-9 w-full rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground italic">
                                    {editingData?.no_agenda || "Otomatis oleh Sistem"}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Sifat Surat</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                    value={data.sifat_surat}
                                    onChange={e => setData('sifat_surat', e.target.value as any)}
                                >
                                    <option value="biasa">Biasa</option>
                                    <option value="penting">Penting</option>
                                    <option value="rahasia">Rahasia</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Media Asli</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                    value={data.media}
                                    onChange={e => setData('media', e.target.value as any)}
                                >
                                    <option value="fisik">Kertas (Fisik)</option>
                                    <option value="digital">Email / File</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-xs">Scan File Surat (PDF/Gambar)</Label>

                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 transition-colors">
                                {data.file_scan ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        <FileText className="h-4 w-4" />
                                        {data.file_scan.name}
                                        <button type="button" onClick={() => setData('file_scan', null)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground text-center">
                                        Belum ada file dipilih.<br/>Klik tombol di bawah.
                                    </span>
                                )}

                                <div className="flex gap-2 w-full mt-2">
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-3 w-3 mr-2" /> Upload
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => cameraInputRef.current?.click()}>
                                        <Camera className="h-3 w-3 mr-2" /> Kamera
                                    </Button>
                                </div>

                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                            </div>
                            <InputError message={errors.file_scan} />
                        </div>
                    </div>

                    <DialogFooter className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
