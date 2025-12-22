import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BidangData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: BidangData | null;
    parentData: { id: number; nama: string } | null; 
}

export default function BidangFormModal({ isOpen, onClose, editingData, parentData }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_bidang: '',
        kode: '',
        parent_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    nama_bidang: editingData.nama_bidang,
                    kode: editingData.kode || '',
                    parent_id: editingData.parent_id ? String(editingData.parent_id) : '',
                });
            } else {
                reset();
                if (parentData) {
                    setData('parent_id', String(parentData.id));
                }
            }
        }
    }, [isOpen, editingData, parentData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose };
        if (editingData) put(`/bidang/${editingData.id}`, options);
        else post('/bidang', options);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editingData ? 'Edit Data' : (parentData ? 'Tambah Sub Bagian/Bidang' : 'Tambah Unit Utama')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-4">
                    {parentData && !editingData && (
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md">
                            <Label className="text-xs text-blue-600 font-semibold">Induk Unit (Atasan)</Label>
                            <div className="text-sm font-medium text-blue-900 mt-1 flex items-center gap-2">
                                <span className="bg-white px-2 py-0.5 rounded shadow-sm border">{parentData.nama}</span>
                            </div>
                            <input type="hidden" value={parentData.id} />
                            <p className="text-[10px] text-blue-500 mt-2">Unit baru ini akan berada di bawah {parentData.nama}.</p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="nama_bidang">Nama Unit / Bagian</Label>
                        <Input
                            id="nama_bidang"
                            value={data.nama_bidang}
                            onChange={e => setData('nama_bidang', e.target.value)}
                            placeholder="Contoh: Sub Bagian Umum"
                            autoFocus
                        />
                        <InputError message={errors.nama_bidang} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="kode">Kode (Opsional)</Label>
                        <Input
                            id="kode"
                            value={data.kode}
                            onChange={e => setData('kode', e.target.value)}
                            placeholder="Contoh: UMUM / KEP"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
