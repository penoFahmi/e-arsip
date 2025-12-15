import { useEffect, useState, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { SuratData } from '../types'; // Hapus UserLite dari import karena kita definisikan lokal atau via API

// Definisi tipe user khusus untuk dropdown bawahan
interface Bawahan {
    id: number;
    name: string;
    jabatan: string;
    role: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    surat: SuratData | null;
    // users: UserLite[]; <-- HAPUS INI, kita tidak butuh data statis lagi
}

export default function DisposisiModal({ isOpen, onClose, surat }: Props) {
    // State untuk menampung data bawahan dari API
    const [bawahanList, setBawahanList] = useState<Bawahan[]>([]);
    const [isLoadingBawahan, setIsLoadingBawahan] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id_surat: '',
        ke_user_id: '',
        sifat_disposisi: 'biasa',
        instruksi: '',
        batas_waktu: '',
        catatan: '',
    });

    useEffect(() => {
        if (isOpen && surat) {
            clearErrors();
            reset();
            setData('id_surat', String(surat.id));

            // [LOGIC BARU] Ambil daftar bawahan sesuai hierarki login
            setIsLoadingBawahan(true);
            fetch('/api/users/bawahan')
                .then((res) => res.json())
                .then((data) => {
                    setBawahanList(data);
                    setIsLoadingBawahan(false);
                })
                .catch((err) => {
                    console.error("Gagal ambil bawahan", err);
                    setIsLoadingBawahan(false);
                });
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Tujuan Disposisi</Label>

                            {/* Dropdown Cerdas */}
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                                value={data.ke_user_id}
                                onChange={e => setData('ke_user_id', e.target.value)}
                                required
                                disabled={isLoadingBawahan}
                            >
                                <option value="">
                                    {isLoadingBawahan ? 'Memuat data...' : '-- Pilih Bawahan --'}
                                </option>

                                {!isLoadingBawahan && bawahanList.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.jabatan})
                                    </option>
                                ))}
                            </select>

                            {/* Pesan jika tidak punya bawahan */}
                            {!isLoadingBawahan && bawahanList.length === 0 && (
                                <p className="text-[10px] text-red-500 mt-1">
                                    Anda tidak memiliki bawahan langsung untuk didisposisikan.
                                </p>
                            )}

                            <InputError message={errors.ke_user_id} />
                        </div>

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
                            placeholder="Contoh: Segera koordinasikan, atau Hadir mewakili saya..."
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

                    {data.sifat_disposisi === 'sangat_segera' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            Prioritas tinggi! Notifikasi khusus akan dikirim.
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing || (bawahanList.length === 0 && !isLoadingBawahan)} className="bg-blue-600 hover:bg-blue-700">
                            <Send className="h-4 w-4 mr-2" />
                            {isLoadingBawahan ? 'Memuat...' : 'Kirim Disposisi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
