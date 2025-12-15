import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, AlertCircle } from 'lucide-react';
import { UserLite, SuratData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    surat: SuratData | null;
    users: UserLite[];
}

export default function DisposisiModal({ isOpen, onClose, surat, users }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id_surat: '',
        ke_user_id: '',
        sifat_disposisi: 'biasa', // [BARU] Default Biasa
        instruksi: '',
        batas_waktu: '',
        catatan: '',
    });

    useEffect(() => {
        if (isOpen && surat) {
            clearErrors();
            reset();
            setData('id_surat', String(surat.id));
        }
    }, [isOpen, surat]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/disposisi', { onSuccess: onClose });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Disposisi Surat</DialogTitle>
                    <DialogDescription>
                        Tindak lanjut surat: <span className="font-semibold text-foreground">{surat?.no_surat}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-2">

                    {/* Baris 1: Tujuan & Sifat */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Tujuan (Pegawai)</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.ke_user_id}
                                onChange={e => setData('ke_user_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.jabatan})</option>
                                ))}
                            </select>
                            <InputError message={errors.ke_user_id} />
                        </div>

                        {/* [BARU] Input Sifat Disposisi */}
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Sifat Instruksi</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.sifat_disposisi}
                                onChange={e => setData('sifat_disposisi', e.target.value)}
                                required
                            >
                                <option value="biasa">Biasa</option>
                                <option value="segera">Segera</option>
                                <option value="sangat_segera">Sangat Segera</option>
                                <option value="rahasia">Rahasia</option>
                            </select>
                            <InputError message={errors.sifat_disposisi} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Isi Instruksi</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={data.instruksi}
                            onChange={e => setData('instruksi', e.target.value)}
                            required
                            placeholder="Contoh: Segera koordinasikan dengan Bappeda..."
                        />
                        <InputError message={errors.instruksi} />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            Batas Waktu <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
                        </Label>
                        <Input
                            type="date"
                            value={data.batas_waktu}
                            onChange={e => setData('batas_waktu', e.target.value)}
                        />
                    </div>

                    {/* Informasi Visual Sifat */}
                    {data.sifat_disposisi === 'sangat_segera' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            Penerima akan mendapat notifikasi prioritas tinggi.
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            <Send className="h-4 w-4 mr-2" /> Kirim Disposisi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
