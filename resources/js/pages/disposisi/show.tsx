import { useState, useRef, FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, FileText, CheckCircle, Clock, Calendar, Printer,
    Save, MapPin, Upload, X, Paperclip
} from 'lucide-react';
import { DisposisiData } from './types';

interface Props {
    disposisi: DisposisiData;
}

export default function DisposisiShow({ disposisi }: Props) {
    // Ambil agenda yang sudah ada (jika ada)
    const existingAgenda = disposisi.surat.agenda?.[0];

    // State untuk Form
    const [isAgenda, setIsAgenda] = useState(!!existingAgenda);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Setup Form Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        status_disposisi: disposisi.status_disposisi,
        catatan: disposisi.catatan || '',

        // Data Agenda (Pre-fill jika ada)
        create_agenda: !!existingAgenda,
        judul_agenda: existingAgenda?.judul_agenda || `Tindak Lanjut: ${disposisi.surat.perihal}`,
        lokasi: existingAgenda?.lokasi || '',
        tgl_mulai: existingAgenda?.tgl_mulai || new Date().toISOString().split('T')[0],
        jam_mulai: existingAgenda?.jam_mulai?.substring(0,5) || '08:00',
        tgl_selesai: existingAgenda?.tgl_selesai || new Date().toISOString().split('T')[0],
        jam_selesai: existingAgenda?.jam_selesai?.substring(0,5) || '10:00',

        file_tindak_lanjut: null as File | null,
    });

    // Sinkron checkbox agenda
    useEffect(() => { setData('create_agenda', isAgenda); }, [isAgenda]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/disposisi/${disposisi.id}`, {
            _method: 'put',
            onSuccess: () => {
                // Optional: Tampilkan notifikasi sukses / scroll to top
            },
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Disposisi Masuk', href: '/disposisi' },
            { title: 'Detail & Tindak Lanjut', href: '#' }
        ]}>
            <Head title={`Disposisi: ${disposisi.surat.no_surat}`} />

            <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-50/50 dark:bg-slate-900/50">

                {/* HEADER BAR (Tetap Tampil) */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-slate-900 shadow-sm shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/disposisi">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold truncate max-w-2xl text-slate-800 dark:text-slate-100">
                                {disposisi.surat.perihal}
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <Badge variant="outline" className="font-mono">{disposisi.surat.no_surat}</Badge>
                                <span>Dari: <span className="font-semibold">{disposisi.surat.pengirim}</span></span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Disposisi: {disposisi.tgl_disposisi}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a href={`/surat-masuk/${disposisi.surat.id}/cetak-disposisi`} target="_blank">
                            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                                <Printer className="h-4 w-4" /> Cetak Lembar
                            </Button>
                        </a>
                    </div>
                </div>

                {/* MAIN CONTENT: SPLIT SCREEN */}
                <div className="flex flex-1 overflow-hidden">

                    {/* [KIRI] DOKUMEN VIEWER */}
                    <div className="w-1/2 border-r bg-slate-100 dark:bg-slate-950 p-4 overflow-y-auto hidden md:block">
                        <Tabs defaultValue="surat" className="w-full h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="surat">Surat Asli (Scan)</TabsTrigger>
                                <TabsTrigger value="lembar">Lembar Disposisi</TabsTrigger>
                            </TabsList>

                            <TabsContent value="surat" className="flex-1 bg-white rounded-lg shadow-sm border min-h-[600px] relative">
                                {disposisi.surat.file_scan?.[0] ? (
                                    <iframe
                                        src={`/storage/${disposisi.surat.file_scan[0].path_file}`}
                                        className="w-full h-full rounded-lg"
                                        title="Surat Asli"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <FileText className="h-16 w-16 mb-4 opacity-20" />
                                        <p>Tidak ada file scan surat.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="lembar" className="flex-1 bg-white rounded-lg shadow-sm border min-h-[600px]">
                                <iframe
                                    src={`/surat-masuk/${disposisi.surat.id}/cetak-disposisi`}
                                    className="w-full h-full rounded-lg"
                                    title="Lembar Disposisi Preview"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* [KANAN] FORM KERJA & INFO */}
                    <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto bg-white dark:bg-slate-900 scroll-smooth">

                        {/* 1. INFO INSTRUKSI */}
                        <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50/20 shadow-sm">
                            <CardHeader className="pb-2 pt-4">
                                <CardTitle className="text-sm font-bold text-blue-700 uppercase flex justify-between items-center">
                                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Instruksi Pimpinan</span>
                                    {disposisi.batas_waktu && (
                                        <Badge variant="destructive" className="text-[10px]">Batas: {disposisi.batas_waktu}</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Pemberi Tugas: <strong>{disposisi.dari_user.name}</strong></span>
                                    <span>Sifat: <strong>{disposisi.sifat_disposisi.toUpperCase()}</strong></span>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900 text-slate-700 dark:text-slate-300 italic">
                                    "{disposisi.instruksi}"
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. FORM LAPORAN (Langsung Disini) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Laporan & Tindak Lanjut</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Status & Catatan */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Status Pengerjaan</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-primary"
                                            value={data.status_disposisi}
                                            onChange={e => setData('status_disposisi', e.target.value)}
                                        >
                                            <option value="terkirim">Baru Masuk</option>
                                            <option value="dibaca">Sedang Dibaca</option>
                                            <option value="tindak_lanjut">Proses Tindak Lanjut</option>
                                            <option value="selesai">✅ Selesai Dikerjakan</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Laporan / Catatan Anda</Label>
                                        <Textarea
                                            className="min-h-[100px] resize-y"
                                            placeholder="Tuliskan hasil tindak lanjut, koordinasi, atau ringkasan pekerjaan..."
                                            value={data.catatan}
                                            onChange={e => setData('catatan', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Bagian Agenda */}
                                <div className={`border rounded-lg p-4 transition-all ${isAgenda ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox
                                            id="agenda_toggle"
                                            checked={isAgenda}
                                            onCheckedChange={(c) => setIsAgenda(!!c)}
                                        />
                                        <Label htmlFor="agenda_toggle" className="cursor-pointer font-semibold">
                                            Buat / Update Agenda Kegiatan
                                        </Label>
                                    </div>

                                    {isAgenda && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Judul Agenda</Label>
                                                <Input value={data.judul_agenda} onChange={e => setData('judul_agenda', e.target.value)} className="bg-white" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Lokasi</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input value={data.lokasi} onChange={e => setData('lokasi', e.target.value)} className="pl-9 bg-white" placeholder="Nama Ruangan / Hotel" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Mulai</Label>
                                                    <div className="flex gap-1">
                                                        <Input type="date" value={data.tgl_mulai} onChange={e => setData('tgl_mulai', e.target.value)} className="bg-white" />
                                                        <Input type="time" value={data.jam_mulai} onChange={e => setData('jam_mulai', e.target.value)} className="bg-white w-24" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Selesai</Label>
                                                    <div className="flex gap-1">
                                                        <Input type="date" value={data.tgl_selesai} onChange={e => setData('tgl_selesai', e.target.value)} className="bg-white" />
                                                        <Input type="time" value={data.jam_selesai} onChange={e => setData('jam_selesai', e.target.value)} className="bg-white w-24" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Upload File Laporan */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" /> Dokumen Bukti / Hasil (Opsional)
                                    </Label>
                                    <div
                                        className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer text-center transition"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {data.file_tindak_lanjut ? (
                                            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                                                <FileText className="h-5 w-5" />
                                                {data.file_tindak_lanjut.name}
                                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500"
                                                    onClick={(e) => { e.stopPropagation(); setData('file_tindak_lanjut', null); }}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500">
                                                <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                                <span>Klik untuk upload Laporan (PDF/Foto)</span>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={e => setData('file_tindak_lanjut', e.target.files?.[0] || null)} />
                                    </div>

                                    {/* Link ke File Lama */}
                                    {disposisi.file_tindak_lanjut && !data.file_tindak_lanjut && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                                            <CheckCircle className="h-4 w-4" />
                                            <a href={`/storage/${disposisi.file_tindak_lanjut}`} target="_blank" className="underline hover:text-blue-800">
                                                Lihat File Laporan Sebelumnya
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 py-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => window.history.back()}>Kembali</Button>
                                    <Button type="submit" disabled={processing} className="min-w-[150px] bg-blue-700 hover:bg-blue-800">
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Laporan
                                    </Button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
