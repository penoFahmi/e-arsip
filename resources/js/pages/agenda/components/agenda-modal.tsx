import { useEffect, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarClock, MapPin, Clock } from 'lucide-react';

interface AgendaData {
    id?: number;
    judul_agenda: string;
    deskripsi: string;
    tgl_mulai: string;
    jam_mulai: string;
    tgl_selesai: string;
    jam_selesai: string;
    lokasi: string;
    warna_label: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: AgendaData | null;
}

export default function AgendaModal({ isOpen, onClose, editingData }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        judul_agenda: '',
        deskripsi: '',
        tgl_mulai: '',
        jam_mulai: '08:00',
        tgl_selesai: '',
        jam_selesai: '10:00',
        lokasi: '',
        warna_label: '#3b82f6',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    judul_agenda: editingData.judul_agenda,
                    deskripsi: editingData.deskripsi || '',
                    tgl_mulai: editingData.tgl_mulai,
                    jam_mulai: editingData.jam_mulai ? editingData.jam_mulai.substring(0, 5) : '08:00',
                    tgl_selesai: editingData.tgl_selesai || editingData.tgl_mulai,
                    jam_selesai: editingData.jam_selesai ? editingData.jam_selesai.substring(0, 5) : '',
                    lokasi: editingData.lokasi || '',
                    warna_label: editingData.warna_label || '#3b82f6',
                });
            } else {
                reset();
                // Default besok
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setData('tgl_mulai', tomorrow.toISOString().split('T')[0]);
                setData('tgl_selesai', tomorrow.toISOString().split('T')[0]);
            }
        }
    }, [isOpen, editingData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose };

        if (editingData?.id) {
            put(`/agenda/${editingData.id}`, options);
        } else {
            post('/agenda', options);
        }
    };

    const colors = [
        { label: 'Biru (Umum)', value: '#3b82f6' },
        { label: 'Merah (Penting)', value: '#ef4444' },
        { label: 'Hijau (Sosialisasi)', value: '#22c55e' },
        { label: 'Kuning (Rapat)', value: '#eab308' },
        { label: 'Ungu (Luar Kantor)', value: '#a855f7' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-orange-500" />
                        {editingData ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label>Judul Kegiatan</Label>
                        <Input
                            value={data.judul_agenda}
                            onChange={e => setData('judul_agenda', e.target.value)}
                            placeholder="Contoh: Rapat Koordinasi Anggaran"
                            required
                        />
                        <InputError message={errors.judul_agenda} />
                    </div>

                    {/* PEMISAHAN INPUT TANGGAL DAN JAM (LEBIH USER FRIENDLY) */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Mulai</Label>
                            <Input
                                type="date"
                                value={data.tgl_mulai}
                                onChange={e => setData('tgl_mulai', e.target.value)}
                                required
                                className="bg-white"
                            />
                            <InputError message={errors.tgl_mulai} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase flex gap-1 items-center"><Clock className="h-3 w-3"/> Jam</Label>
                            <Input
                                type="time"
                                value={data.jam_mulai}
                                onChange={e => setData('jam_mulai', e.target.value)}
                                required
                                className="bg-white"
                            />
                            <InputError message={errors.jam_mulai} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Selesai (Opsional)</Label>
                            <Input
                                type="date"
                                value={data.tgl_selesai}
                                onChange={e => setData('tgl_selesai', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase flex gap-1 items-center"><Clock className="h-3 w-3"/> Jam</Label>
                            <Input
                                type="time"
                                value={data.jam_selesai}
                                onChange={e => setData('jam_selesai', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Lokasi</Label>
                        <div className="relative">
                            <Input
                                className="pl-8"
                                value={data.lokasi}
                                onChange={e => setData('lokasi', e.target.value)}
                                placeholder="Ruang Rapat..."
                            />
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Label Warna</Label>
                        <div className="flex gap-3 mt-1">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setData('warna_label', c.value)}
                                    className={`w-8 h-8 rounded-full shadow-sm transition-all flex items-center justify-center ${data.warna_label === c.value ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                >
                                    {data.warna_label === c.value && <span className="text-white text-xs font-bold">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>deskripsi / Catatan</Label>
                        <Textarea
                            value={data.deskripsi}
                            onChange={e => setData('deskripsi', e.target.value)}
                            placeholder="Detail kegiatan..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">Simpan Agenda</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
