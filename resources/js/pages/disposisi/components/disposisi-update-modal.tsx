import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { DisposisiData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    disposisi: DisposisiData | null;
}

export default function DisposisiUpdateModal({ isOpen, onClose, disposisi }: Props) {
    const { data, setData, put, processing, reset } = useForm({
        status_disposisi: '',
        catatan: '',
    });

    useEffect(() => {
        if (isOpen && disposisi) {
            setData({
                status_disposisi: disposisi.status_disposisi,
                catatan: disposisi.catatan || '',
            });
        }
    }, [isOpen, disposisi]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!disposisi) return;

        put(`/disposisi/${disposisi.id}`, {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tindak Lanjut Disposisi</DialogTitle>
                    <DialogDescription>
                        Update progres pengerjaan Anda.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Status Pengerjaan</Label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={data.status_disposisi}
                            onChange={e => setData('status_disposisi', e.target.value)}
                        >
                            <option value="terkirim">Baru Masuk</option>
                            <option value="dibaca">Sudah Dibaca</option>
                            <option value="tindak_lanjut">Sedang Ditindaklanjuti</option>
                            <option value="selesai">Selesai Dikerjakan</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Laporan / Catatan Balasan</Label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.catatan}
                            onChange={e => setData('catatan', e.target.value)}
                            placeholder="Laporan singkat pengerjaan..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
