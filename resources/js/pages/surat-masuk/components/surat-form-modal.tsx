// resources/js/pages/surat-masuk/components/surat-form-modal.tsx
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
import { SuratData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: SuratData | null; // Jika null berarti mode CREATE, jika ada isinya berarti EDIT
}

export default function SuratFormModal({ isOpen, onClose, editingData }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        no_agenda: '',
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

    // Reset atau isi form saat modal dibuka/data berubah
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    no_agenda: editingData.no_agenda,
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingData ? 'Edit Surat' : 'Input Surat Masuk'}</DialogTitle>
                    <DialogDescription>Isi Data surat dan upload file scan.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Kolom Kiri */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="no_agenda">Nomor Agenda</Label>
                            <Input id="no_agenda" value={data.no_agenda} onChange={e => setData('no_agenda', e.target.value)} required placeholder="Contoh: 1" />
                            <InputError message={errors.no_agenda} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="no_surat">Nomor Surat</Label>
                            <Input id="no_surat" value={data.no_surat} onChange={e => setData('no_surat', e.target.value)} required placeholder="Contoh: 400/123/BKAD" />
                            <InputError message={errors.no_surat} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="pengirim">Pengirim</Label>
                            <Input id="pengirim" value={data.pengirim} onChange={e => setData('pengirim', e.target.value)} required placeholder="Contoh: Dinas PU" />
                            <InputError message={errors.pengirim} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="perihal">Perihal</Label>
                            <Input id="perihal" value={data.perihal} onChange={e => setData('perihal', e.target.value)} required />
                            <InputError message={errors.perihal} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                        <div className="space-y-1">
                            <Label htmlFor="file_scan">File Scan (PDF/Img)</Label>
                            <Input id="file_scan" type="file" accept=".pdf,.jpg,.png" onChange={e => setData('file_scan', e.target.files ? e.target.files[0] : null)} />
                            <InputError message={errors.file_scan} />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label htmlFor="ringkasan">Ringkasan</Label>
                        <textarea id="ringkasan" className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            value={data.ringkasan} onChange={e => setData('ringkasan', e.target.value)} placeholder="Catatan..." />
                    </div>

                    <DialogFooter className="col-span-1 md:col-span-2 mt-2 gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
