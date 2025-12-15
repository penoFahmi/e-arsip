import { useEffect, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { SuratData, BidangOption } from '../types';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: SuratData | null;
    bidangs: BidangOption[];
}

export default function SuratFormModal({ isOpen, onClose, editingData, bidangs }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        // no_agenda: '',
        kode_klasifikasi: '',
        id_bidang_penerima: '',
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

    // Camera input ref
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    no_agenda: editingData.no_agenda,
                    kode_klasifikasi: editingData.kode_klasifikasi || '',
                    id_bidang_penerima: editingData.id_bidang_penerima ? String(editingData.id_bidang_penerima) : '',
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

    // Helper untuk menangani hasil foto kamera
    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file_scan', file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose, forceFormData: true };

        if (editingData) {
            router.post(`/surat-masuk/${editingData.id}`, {
                _method: 'put',
                ...data,
            }, options);
        } else {
            post('/surat-masuk', options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingData ? 'Edit Surat' : 'Input Surat Masuk'}</DialogTitle>
                    <DialogDescription>Pastikan data surat sesuai dengan fisik.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">

                    {/* --- Kolom Kiri: Identitas Surat --- */}
                    <div className="space-y-4 border-r md:pr-4 border-gray-100">
                        <div className="space-y-1">
                            <Label htmlFor="no_agenda">Nomor Agenda</Label>
                            <Input
                                id="no_agenda"
                                value={editingData ? editingData.no_agenda : "Diisi Otomatis oleh Sistem"}
                                disabled
                                className="bg-gray-100 text-muted-foreground font-medium"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="kode_klasifikasi">Kode Klasifikasi</Label>
                            <Input id="kode_klasifikasi" value={data.kode_klasifikasi} onChange={e => setData('kode_klasifikasi', e.target.value)} placeholder="Contoh: 900 (Keuangan)" />
                            <InputError message={errors.kode_klasifikasi} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="no_surat">Nomor Surat</Label>
                            <Input id="no_surat" value={data.no_surat} onChange={e => setData('no_surat', e.target.value)} required placeholder="Nomor Surat Dinas" />
                            <InputError message={errors.no_surat} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pengirim">Asal Surat / Pengirim</Label>
                            <Input id="pengirim" value={data.pengirim} onChange={e => setData('pengirim', e.target.value)} required />
                            <InputError message={errors.pengirim} />
                        </div>

                        {/* [BARU] Input Tujuan Awal */}
                        <div className="space-y-1 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            <Label htmlFor="id_bidang_penerima" className="text-yellow-800">Diterima Langsung Oleh</Label>
                            <select
                                id="id_bidang_penerima"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
                                value={data.id_bidang_penerima}
                                onChange={e => setData('id_bidang_penerima', e.target.value)}
                            >
                                <option value="">-- Pimpinan Tertinggi / Sekretariat (Default) --</option>
                                {bidangs.map(b => (
                                    <option key={b.id} value={b.id}>Langsung ke: {b.nama_bidang}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-yellow-700 mt-1">
                                Pilih jika surat ini tidak perlu disposisi dari Pimpinan Utama (Bypass).
                            </p>
                            <InputError message={errors.id_bidang_penerima} />
                        </div>
                    </div>

                    {/* --- Kolom Kanan: Detail & File --- */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="perihal">Perihal</Label>
                            <textarea
                                id="perihal"
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                value={data.perihal}
                                onChange={e => setData('perihal', e.target.value)}
                                required
                            />
                            <InputError message={errors.perihal} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Tgl. Surat</Label>
                                <Input type="date" value={data.tgl_surat} onChange={e => setData('tgl_surat', e.target.value)} required />
                                <InputError message={errors.tgl_surat} />
                            </div>
                            <div className="space-y-1">
                                <Label>Tgl. Terima</Label>
                                <Input type="date" value={data.tgl_terima} onChange={e => setData('tgl_terima', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Sifat</Label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                                    value={data.sifat_surat} onChange={e => setData('sifat_surat', e.target.value as any)}>
                                    <option value="biasa">Biasa</option>
                                    <option value="penting">Penting</option>
                                    <option value="rahasia">Rahasia</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Media</Label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                                    value={data.media} onChange={e => setData('media', e.target.value as any)}>
                                    <option value="fisik">Fisik</option>
                                    <option value="digital">Digital</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file_scan">File Lampiran</Label>

                            <div className="flex flex-col gap-3">
                                {/* Opsi 1: Upload Biasa (PDF/Gambar) */}
                                <Input
                                    id="file_scan"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setData('file_scan', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />

                                {/* Opsi 2: Tombol Khusus Kamera (Hanya muncul/efektif di HP) */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full gap-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50"
                                        onClick={() => cameraInputRef.current?.click()}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Buka Kamera / Scan
                                    </Button>

                                    {/* Input Tersembunyi khusus Kamera */}
                                    <input
                                        type="file"
                                        ref={cameraInputRef}
                                        accept="image/*"
                                        capture="environment" // INI KUNCINYA: Memaksa buka kamera belakang
                                        className="hidden"
                                        onChange={handleCameraCapture}
                                    />
                                </div>
                            </div>

                            {/* Preview Nama File yang dipilih */}
                            {data.file_scan && (
                                <div className="text-xs bg-green-50 text-green-700 p-2 rounded border border-green-200 mt-1">
                                    File terpilih: <strong>{data.file_scan.name}</strong>
                                    <br /> Ukuran: {(data.file_scan.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            )}

                            <p className="text-[10px] text-muted-foreground">
                                Gunakan tombol kamera untuk memotret surat langsung dari HP.
                            </p>
                            <InputError message={errors.file_scan} />
                        </div>
                    </div>

                    <DialogFooter className="col-span-1 md:col-span-2 mt-4 gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="min-w-[100px]">
                            {processing ? 'Menyimpan...' : 'Simpan Surat'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
