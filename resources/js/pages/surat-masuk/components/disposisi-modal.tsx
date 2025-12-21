import { useEffect, useState, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Import Badge
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, AlertCircle, Sparkles, UserCheck } from 'lucide-react'; // Icon baru
import { SuratData } from '../types';

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
}

export default function DisposisiModal({ isOpen, onClose, surat }: Props) {
    const [bawahanList, setBawahanList] = useState<Bawahan[]>([]);
    const [isLoadingBawahan, setIsLoadingBawahan] = useState(false);

    // [BARU] Daftar Template Instruksi yang sering dipakai
    const quickInstructions = [
        "Mohon ditindaklanjuti",
        "Untuk diketahui",
        "Koordinasikan",
        "Hadiri / Wakili",
        "Siapkan bahan",
        "Telaah & Saran",
        "Arsipkan",
    ];

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

    // Fungsi menambah instruksi cepat
    const addInstruction = (text: string) => {
        // Jika sudah ada teks, tambahkan koma
        const current = data.instruksi;
        const separator = current.length > 0 ? ", " : "";
        setData('instruksi', current + separator + text);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/disposisi', { onSuccess: onClose });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle>Disposisi Surat</DialogTitle>
                            <DialogDescription>
                                Instruksikan bawahan untuk menindaklanjuti surat ini.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-muted/30 p-3 rounded-md border border-dashed text-xs text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">Ref Surat:</span> {surat?.perihal}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Tujuan Disposisi <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <UserCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm focus:ring-1 focus:ring-primary disabled:opacity-50"
                                    value={data.ke_user_id}
                                    onChange={e => setData('ke_user_id', e.target.value)}
                                    required
                                    disabled={isLoadingBawahan}
                                >
                                    <option value="">
                                        {isLoadingBawahan ? 'Memuat...' : '-- Pilih Bawahan --'}
                                    </option>
                                    {!isLoadingBawahan && bawahanList.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} — {u.jabatan}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <InputError message={errors.ke_user_id} />

                            {!isLoadingBawahan && bawahanList.length === 0 && (
                                <p className="text-[10px] text-orange-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Tidak ada bawahan langsung.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Sifat Instruksi</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                value={data.sifat_disposisi}
                                onChange={e => setData('sifat_disposisi', e.target.value)}
                                required
                            >
                                <option value="biasa">Biasa</option>
                                <option value="segera">Segera</option>
                                <option value="sangat_segera">Sangat Segera</option>
                                <option value="rahasia">Rahasia</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex justify-between items-center">
                            Isi Instruksi <span className="text-red-500">*</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                Klik tag di bawah untuk isi cepat
                            </span>
                        </Label>

                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                            value={data.instruksi}
                            onChange={e => setData('instruksi', e.target.value)}
                            required
                            placeholder="Ketik instruksi manual disini..."
                        />

                        {/* [BARU] Quick Instructions Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {quickInstructions.map((text) => (
                                <Badge
                                    key={text}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-normal text-xs py-1"
                                    onClick={() => addInstruction(text)}
                                >
                                    + {text}
                                </Badge>
                            ))}
                        </div>

                        <InputError message={errors.instruksi} />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            Batas Waktu Penyelesaian <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
                        </Label>
                        <Input
                            type="date"
                            value={data.batas_waktu}
                            onChange={e => setData('batas_waktu', e.target.value)}
                            className="w-full md:w-1/2"
                        />
                    </div>

                    {data.sifat_disposisi === 'sangat_segera' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 animate-pulse">
                            <AlertCircle className="h-4 w-4" />
                            <strong>Perhatian:</strong> Notifikasi "Sangat Segera" akan dikirim ke HP bawahan!
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t mt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button
                            type="submit"
                            disabled={processing || (bawahanList.length === 0 && !isLoadingBawahan)}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isLoadingBawahan ? 'Memuat Data...' : 'Kirim Disposisi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
