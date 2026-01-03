import { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Search, FileText, User as UserIcon, Calendar,
    CheckCircle, Clock, AlertCircle, ArrowRight, Eye
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Pencil, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Kita pakai tipe data yang mirip, sesuaikan jika perlu
interface DisposisiOutgoing {
    id: number;
    tgl_disposisi: string;
    instruksi: string;
    sifat_disposisi: string;
    status_disposisi: string;
    catatan?: string; // Laporan bawahan
    file_tindak_lanjut?: string; // File hasil kerja bawahan
    surat: {
        no_surat: string;
        perihal: string;
    };
    ke_user: {
        name: string;
        jabatan: string;
    };
}

interface Props extends PageProps {
    disposisis: { data: DisposisiOutgoing[]; links: any[] };
    filters: { search: string };
}

export default function DisposisiOutgoing({ disposisis, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { delete: destroy } = useForm();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/disposisi/outgoing', { search }, { preserveState: true });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'terkirim': return <Badge variant="outline" className="text-gray-500 border-gray-300">Belum Dibaca</Badge>;
            case 'dibaca': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Sedang Dilihat</Badge>;
            case 'tindak_lanjut': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Sedang Dikerjakan</Badge>;
            case 'selesai': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Selesai</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menarik kembali/menghapus disposisi ini?')) {
            destroy(`/disposisi/${id}`, {
                onSuccess: () => toast.success('Disposisi berhasil ditarik kembali.'),
                onError: () => toast.error('Gagal menghapus disposisi.')
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Monitoring Disposisi', href: '#' }
        ]}>
            <Head title="Riwayat Disposisi Keluar" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Header Page */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Monitoring Disposisi</h2>
                        <p className="text-sm text-muted-foreground">
                            Pantau status tugas yang Anda berikan kepada bawahan.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Input
                            placeholder="Cari Bawahan / Perihal..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="pl-8 bg-background"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Content List */}
                {disposisis.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="bg-muted p-4 rounded-full mb-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Belum ada riwayat</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Anda belum pernah mengirim disposisi kepada siapapun.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {disposisis.data.map((item) => (
                            <Card key={item.id} className="hover:shadow-md transition-all border-l-4 border-l-purple-500">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>Dikirim: {item.tgl_disposisi}</span>
                                                <span>•</span>
                                                <span className="uppercase font-bold text-xs">{item.sifat_disposisi}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 leading-snug">
                                                {item.surat.perihal}
                                            </h3>
                                            <div className="text-xs text-gray-500">
                                                No Surat: {item.surat.no_surat}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(item.status_disposisi)}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-2 bg-gray-50/50 border-y border-dashed mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {/* Kolom Kiri: Instruksi Kita */}
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                                <UserIcon className="h-3 w-3" /> Ditujukan Kepada:
                                            </div>
                                            <div className="font-medium text-gray-900 mb-2">
                                                {item.ke_user.name} <span className="text-gray-400 font-normal">({item.ke_user.jabatan})</span>
                                            </div>

                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Instruksi Anda:</div>
                                            <p className="italic text-gray-600 bg-white p-2 rounded border border-gray-200">
                                                "{item.instruksi}"
                                            </p>
                                        </div>

                                        {/* Kolom Kanan: Respon Bawahan */}
                                        <div className="border-l pl-0 md:pl-4 border-gray-200">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> Laporan / Tindak Lanjut:
                                            </div>

                                            {item.status_disposisi === 'selesai' ? (
                                                <div className="space-y-2">
                                                    {item.catatan ? (
                                                        <p className="text-green-800 bg-green-50 p-2 rounded border border-green-100 text-sm">
                                                            "{item.catatan}"
                                                        </p>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Tidak ada catatan teks.</span>
                                                    )}

                                                    {item.file_tindak_lanjut ? (
                                                        <a
                                                            href={`/storage/${item.file_tindak_lanjut}`}
                                                            target="_blank"
                                                            className="flex items-center gap-2 text-blue-600 hover:underline font-medium text-xs bg-blue-50 p-2 rounded w-fit"
                                                        >
                                                            <FileText className="h-3 w-3" /> Download Bukti Laporan
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" /> Tidak ada file lampiran laporan.
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded text-xs">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Menunggu laporan dari bawahan...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-3 bg-gray-50 flex justify-between items-center border-t">
                                    <div className="flex gap-2">
                                        {['terkirim', 'dibaca'].includes(item.status_disposisi) && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Tarik/Batal
                                                </Button>
                                                {/* <Button variant="outline" size="sm" className="h-8 text-xs">
                                                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                                                </Button> */}
                                            </>
                                        )}
                                    </div>

                                    {/* Link Lihat Surat */}
                                    <Button variant="ghost" size="sm" asChild className="text-xs ml-auto">
                                        <Link href={`/surat-masuk/${item.surat.id}`}>
                                            Lihat Surat <ArrowRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
