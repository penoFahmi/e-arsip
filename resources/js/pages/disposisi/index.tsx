import { useState, FormEventHandler } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Search, Eye, Clock, CheckCircle, AlertCircle, FileText, User as UserIcon, Send } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Tipe Data
interface SuratData {
    no_surat: string;
    perihal: string;
    pengirim: string;
    file_scan?: { path_file: string }[];
}

interface UserData {
    name: string;
    jabatan?: string;
}

interface DisposisiData {
    id: number;
    tgl_disposisi: string;
    instruksi: string;
    batas_waktu?: string;
    status_disposisi: 'terkirim' | 'dibaca' | 'diproses' | 'selesai';
    catatan?: string; // Catatan balasan dari penerima
    surat: SuratData;
    dari_user: UserData;
}

interface Props extends PageProps {
    disposisis: { data: DisposisiData[]; links: any[] };
    filters: { search: string };
}

export default function DisposisiIndex({ disposisis, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // State Modal Update Status
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedDisposisi, setSelectedDisposisi] = useState<DisposisiData | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        status_disposisi: '',
        catatan: '',
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/disposisi', { search }, { preserveState: true });
        }
    };

    const openUpdateModal = (item: DisposisiData) => {
        setSelectedDisposisi(item);
        setData({
            status_disposisi: item.status_disposisi,
            catatan: item.catatan || '',
        });
        setIsUpdateModalOpen(true);
    };

    const submitUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedDisposisi) return;

        put(`/disposisi/${selectedDisposisi.id}`, {
            onSuccess: () => setIsUpdateModalOpen(false),
        });
    };

    // Helper Status Color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'terkirim': return <Badge variant="secondary">Baru Masuk</Badge>;
            case 'dibaca': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Sudah Dibaca</Badge>;
            case 'diproses': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Sedang Diproses</Badge>;
            case 'selesai': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Selesai</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Disposisi Masuk', href: '/disposisi' }]}>
            <Head title="Disposisi Masuk" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Disposisi Masuk</h2>
                        <p className="text-sm text-muted-foreground">Daftar tugas dan disposisi yang perlu Anda tindak lanjuti.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Input
                            placeholder="Cari No Surat / Perihal..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="pl-8"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* List Disposisi (Card Style agar lebih enak dibaca isinya) */}
                <div className="grid grid-cols-1 gap-4">
                    {disposisis.data.map((item) => (
                        <div key={item.id} className={`relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all ${item.status_disposisi === 'terkirim' ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-sidebar-border/70'}`}>

                            {/* Kiri: Info Surat */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Tgl Disposisi: {item.tgl_disposisi}</span>
                                    {item.batas_waktu && (
                                        <span className="text-red-600 font-medium ml-2">• Batas Waktu: {item.batas_waktu}</span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                    {item.surat.perihal}
                                </h3>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Dari:</span> {item.surat.pengirim} <br/>
                                    <span className="font-medium">No. Surat:</span> {item.surat.no_surat}
                                </div>

                                {/* Link File */}
                                {item.surat.file_scan?.[0] && (
                                    <div className="pt-2">
                                        <a
                                            href={`/storage/${item.surat.file_scan[0].path_file}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            <FileText className="h-3 w-3" /> Lihat File Surat
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Tengah: Instruksi */}
                            <div className="flex-1 border-t md:border-t-0 md:border-l border-dashed border-gray-200 pt-3 md:pt-0 md:pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                        <UserIcon className="h-3 w-3 text-gray-500" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">
                                        {item.dari_user.name} <span className="text-gray-400 font-normal">menginstruksikan:</span>
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                    "{item.instruksi}"
                                </p>

                                {/* Catatan Balasan Anda */}
                                {item.catatan && (
                                    <div className="mt-3 text-xs">
                                        <span className="font-semibold text-gray-500">Laporan Anda:</span>
                                        <p className="text-gray-700 mt-1">{item.catatan}</p>
                                    </div>
                                )}
                            </div>

                            {/* Kanan: Aksi & Status */}
                            <div className="flex flex-row md:flex-col justify-between items-end gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 min-w-[140px]">
                                <div className="w-full text-right">
                                    {getStatusBadge(item.status_disposisi)}
                                </div>
                                <Button
                                    size="sm"
                                    variant={item.status_disposisi === 'selesai' ? 'outline' : 'default'}
                                    onClick={() => openUpdateModal(item)}
                                    className="w-full md:w-auto"
                                >
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    Update Status
                                </Button>
                            </div>

                        </div>
                    ))}

                    {disposisis.data.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground bg-white border border-dashed rounded-xl">
                            <Send className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            Belum ada disposisi masuk untuk Anda.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Update Status */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tindak Lanjut Disposisi</DialogTitle>
                        <DialogDescription>
                            Update status pengerjaan dan berikan laporan singkat.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUpdate} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status Pengerjaan</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.status_disposisi}
                                onChange={e => setData('status_disposisi', e.target.value)}
                            >
                                <option value="terkirim">Baru Masuk (Belum Dibaca)</option>
                                <option value="dibaca">Sudah Dibaca</option>
                                <option value="diproses">Sedang Diproses</option>
                                <option value="selesai">Selesai Dikerjakan</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Laporan / Catatan Balasan</Label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.catatan}
                                onChange={e => setData('catatan', e.target.value)}
                                placeholder="Contoh: Sudah dikoordinasikan dengan bidang terkait..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsUpdateModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                Simpan Laporan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
