import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
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
import { BidangData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: BidangData | null;
}

export default function BidangFormModal({ isOpen, onClose, editingData }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_bidang: '',
        kode: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    nama_bidang: editingData.nama_bidang,
                    kode: editingData.kode,
                });
            } else {
                reset();
            }
        }
    }, [isOpen, editingData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose };

        if (editingData) {
            put(`/bidang/${editingData.id}`, options);
        } else {
            post('/bidang', options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingData ? 'Edit Bidang' : 'Tambah Bidang Baru'}</DialogTitle>
                    <DialogDescription>
                        Pastikan Kode Bidang unik (singkatan).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nama_bidang">Nama Bidang / Unit</Label>
                        <Input
                            id="nama_bidang"
                            value={data.nama_bidang}
                            onChange={e => setData('nama_bidang', e.target.value)}
                            placeholder="Contoh: Bidang Perbendaharaan"
                            required
                        />
                        <InputError message={errors.nama_bidang} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="kode">Kode Singkatan</Label>
                        <Input
                            id="kode"
                            value={data.kode}
                            onChange={e => setData('kode', e.target.value)}
                            placeholder="Contoh: BEN, ANG, SEK"
                            required
                        />
                        <InputError message={errors.kode} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
