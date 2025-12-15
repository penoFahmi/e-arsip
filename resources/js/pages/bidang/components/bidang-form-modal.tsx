import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BidangData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: BidangData | null;
    parentOptions: { id: number; nama_bidang: string }[]; // [BARU]
}

export default function BidangFormModal({ isOpen, onClose, editingData, parentOptions }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_bidang: '',
        kode: '',
        parent_id: '', // [BARU]
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
                    <DialogTitle>{editingData ? 'Edit Unit Kerja' : 'Tambah Unit Kerja'}</DialogTitle>
                    <DialogDescription>
                        Struktur organisasi bersifat hierarki (Induk - Anak).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-4">
                    {/* [BARU] Input Parent ID */}
                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">Induk Unit (Opsional)</Label>
                        <select
                            id="parent_id"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={data.parent_id}
                            onChange={e => setData('parent_id', e.target.value)}
                        >
                            <option value="">-- Tidak Ada (Unit Utama / Sekretariat) --</option>
                            {parentOptions
                                .filter(p => p.id !== editingData?.id) // Cegah memilih diri sendiri
                                .map(p => (
                                <option key={p.id} value={p.id}>{p.nama_bidang}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                            Pilih induk jika ini adalah Sub-Bagian atau Sub-Bidang.
                        </p>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="nama_bidang">Nama Unit Kerja</Label>
                        <Input
                            id="nama_bidang"
                            value={data.nama_bidang}
                            onChange={e => setData('nama_bidang', e.target.value)}
                            placeholder="Contoh: Sub Bagian Keuangan"
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
                            placeholder="Contoh: KEU"
                        />
                        <InputError message={errors.kode} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
