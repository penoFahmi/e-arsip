import { useEffect, FormEventHandler, useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, Clock, FileText, CheckCircle, Paperclip, Upload, X} from 'lucide-react';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { DisposisiData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    disposisi: DisposisiData | null;
}

export default function DisposisiUpdateModal({ isOpen, onClose, disposisi }: Props) {
    const [isAgenda, setIsAgenda] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing, reset, errors } = useForm({
        status_disposisi: '',
        catatan: '',
        create_agenda: false,
        judul_agenda: '',
        lokasi: '',
        tgl_mulai: '',
        jam_mulai: '',
        tgl_selesai: '',
        jam_selesai: '',
        file_tindak_lanjut: null as File | null, // [BARU]
    });

    useEffect(() => {
        if (isOpen && disposisi) {
            setData({
                status_disposisi: disposisi.status_disposisi,
                catatan: disposisi.catatan || '',
                create_agenda: false,
                judul_agenda: `Tindak Lanjut: ${disposisi.surat.perihal}`,
                lokasi: '',
                tgl_mulai: new Date().toISOString().split('T')[0],
                jam_mulai: '08:00',
                tgl_selesai: new Date().toISOString().split('T')[0],
                jam_selesai: '10:00',
                file_tindak_lanjut: null,
            });
            setIsAgenda(false);
        }
    }, [isOpen, disposisi]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setData('file_tindak_lanjut', e.target.files[0]);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!disposisi) return;

        router.post(`/disposisi/${disposisi.id}`, {
            _method: 'put',
            ...data,
            create_agenda: isAgenda,
        }, {
            onSuccess: () => {
                onClose();
                reset();
            },
            forceFormData: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tindak Lanjut & Laporan</DialogTitle>
                    <DialogDescription>
                        Update status pengerjaan atau buat agenda kegiatan jika diperlukan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5 py-4">

                    {/* --- STATUS & CATATAN --- */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Status Pengerjaan</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                value={data.status_disposisi}
                                onChange={e => setData('status_disposisi', e.target.value)}
                            >
                                <option value="terkirim">Baru Masuk</option>
                                <option value="dibaca">Sudah Dibaca</option>
                                <option value="tindak_lanjut">Sedang Ditindaklanjuti</option>
                                <option value="selesai">Selesai Dikerjakan</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label>Laporan / Catatan Balasan</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                value={data.catatan}
                                onChange={e => setData('catatan', e.target.value)}
                                placeholder="Contoh: Sudah dikoordinasikan, akan dihadiri hari Selasa..."
                            />
                        </div>
                    </div>

                    {/* --- FITUR AGENDA CERDAS --- */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="create_agenda"
                                checked={isAgenda}
                                onCheckedChange={(checked) => setIsAgenda(checked as boolean)}
                            />
                            <Label htmlFor="create_agenda" className="cursor-pointer font-semibold text-blue-800">
                                Buat Agenda Kegiatan?
                            </Label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6 -mt-3">
                            Centang jika disposisi ini memerlukan jadwal/kegiatan (Rapat, Undangan, DL).
                        </p>

                        {isAgenda && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1">
                                    <Label className="text-xs">Judul Kegiatan</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            value={data.judul_agenda}
                                            onChange={e => setData('judul_agenda', e.target.value)}
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Lokasi / Tempat</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            value={data.lokasi}
                                            onChange={e => setData('lokasi', e.target.value)}
                                            placeholder="Contoh: Ruang Rapat Aula / Hotel Mercure"
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Mulai</Label>
                                        <div className="flex gap-1">
                                            <Input type="date" className="h-9 text-xs" value={data.tgl_mulai} onChange={e => setData('tgl_mulai', e.target.value)} />
                                            <Input type="time" className="h-9 text-xs w-20" value={data.jam_mulai} onChange={e => setData('jam_mulai', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Selesai</Label>
                                        <div className="flex gap-1">
                                            <Input type="date" className="h-9 text-xs" value={data.tgl_selesai} onChange={e => setData('tgl_selesai', e.target.value)} />
                                            <Input type="time" className="h-9 text-xs w-20" value={data.jam_selesai} onChange={e => setData('jam_selesai', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- UPLOAD FILE TINDAK LANJUT (BARU) --- */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold flex items-center gap-2">
                            <Paperclip className="h-3.5 w-3.5" /> Upload Dokumen Hasil (Opsional)
                        </Label>

                        <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             {data.file_tindak_lanjut ? (
                                <div className="flex items-center justify-between text-sm text-green-700 font-medium">
                                    <span className="flex items-center gap-2 truncate">
                                        <FileText className="h-4 w-4" />
                                        {data.file_tindak_lanjut.name}
                                    </span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        onClick={(e) => { e.stopPropagation(); setData('file_tindak_lanjut', null); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                                    <Upload className="h-4 w-4" />
                                    <span>Klik untuk upload Excel / PDF / Foto Hasil</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>
                        {/* Jika sudah ada file sebelumnya di server (opsional ditampilkan disini) */}
                        {disposisi?.file_tindak_lanjut && !data.file_tindak_lanjut && (
                            <div className="text-[10px] text-blue-600 flex items-center gap-1 pl-1">
                                <CheckCircle className="h-3 w-3" /> Sudah ada file sebelumnya. Upload baru untuk mengganti.
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            {isAgenda ? 'Simpan & Buat Agenda' : 'Simpan Laporan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
