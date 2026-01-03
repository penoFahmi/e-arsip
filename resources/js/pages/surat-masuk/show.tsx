import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import {
    ArrowLeft, Calendar, FileText, User as UserIcon,
    Clock, CheckCircle, Send, AlertCircle, File, Printer, Pencil, Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import SuratFormModal from './components/surat-form-modal';
import DisposisiModal from './components/disposisi-modal';
import { SuratData } from './types';

interface Props extends PageProps {
    surat: SuratData;
}

export default function SuratMasukShow({ surat }: Props) {
    const { auth } = usePage<any>().props;
    const currentUser = auth.user;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDisposisiOpen, setIsDisposisiOpen] = useState(false);

    const checkPermission = (action: 'edit' | 'delete' | 'disposisi') => {
        if (action === 'disposisi') {
             if (['level_1', 'level_2', 'level_3', 'super_admin'].includes(currentUser.role)) return true;
             toast.error("Akses Ditolak!", { description: "Hanya Pejabat yang dapat melakukan disposisi." });
             return false;
        }

        if (currentUser.role === 'super_admin') return true;

        if (surat.id_user_input === currentUser.id) return true;

        if (currentUser.role === 'admin_bidang') return true;

        if (currentUser.role === 'level_1' || currentUser.role === 'level_2') {
            toast.error("Akses Ditolak!", { description: "Pejabat tidak boleh mengubah arsip surat." });
            return false;
        }

        toast.error("Akses Dibatasi", { description: "Anda hanya dapat mengubah surat buatan sendiri." });
        return false;
    };

    const handleDelete = () => {
        if (!checkPermission('delete')) return;
        if (confirm('Yakin hapus surat ini permanen? Data disposisi juga akan hilang.')) {
            router.delete(`/surat-masuk/${surat.id}`);
        }
    };

    const getTrackingIcon = (aksi: string) => {
        switch(aksi) {
            case 'input': return <FileText className="h-4 w-4 text-blue-600" />;
            case 'disposisi': return <Send className="h-4 w-4 text-purple-600" />;
            case 'selesai': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'edit': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Surat Masuk', href: '/surat-masuk' },
        { title: 'Detail Surat', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Surat: ${surat.no_surat}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* HEADER: Tombol Kembali & Aksi */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Link href="/surat-masuk">
                        <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar
                        </Button>
                    </Link>

                    <div className="flex flex-wrap gap-2">
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkPermission('disposisi') && setIsDisposisiOpen(true)}
                        >
                            <Send className="h-4 w-4 mr-2 text-purple-600" /> Disposisi
                        </Button>

                        <a href={`/surat-masuk/${surat.id}/cetak-disposisi`} target="_blank">
                            <Button variant="outline" size="sm">
                                <Printer className="h-4 w-4 mr-2" /> Lembar Disposisi
                            </Button>
                        </a>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkPermission('edit') && setIsEditOpen(true)}
                        >
                            <Pencil className="h-4 w-4 mr-2 text-blue-600" /> Edit
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KOLOM KIRI: INFO SURAT & FILE */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <FileText className="h-32 w-32" />
                            </div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {surat.no_agenda}
                                        </Badge>
                                        <Badge variant={surat.sifat_surat === 'rahasia' ? 'destructive' : 'secondary'} className="capitalize">
                                            {surat.sifat_surat}
                                        </Badge>
                                    </div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                        {surat.perihal}
                                    </h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm relative z-10">
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Nomor Surat</p>
                                    <p className="font-medium text-gray-900 text-base">{surat.no_surat}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Pengirim / Instansi</p>
                                    <p className="font-medium text-gray-900 text-base">{surat.pengirim}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Tanggal Surat</p>
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {surat.tgl_surat}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Diterima Tanggal</p>
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        {surat.tgl_terima}
                                    </div>
                                </div>
                            </div>

                            {surat.ringkasan && (
                                <div className="mt-6 pt-4 border-t relative z-10">
                                    <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Ringkasan Isi</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-dashed leading-relaxed">
                                        {surat.ringkasan}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* PREVIEW FILE */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm h-[600px] flex flex-col">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <File className="h-4 w-4 text-blue-600" /> Lampiran Digital
                            </h3>

                            {surat.file_scan && surat.file_scan.length > 0 ? (
                                <iframe
                                    src={`/storage/${surat.file_scan[0].path_file}`}
                                    className="w-full h-full rounded-lg border bg-gray-100"
                                    title="Preview File"
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col bg-gray-50 rounded-lg border-2 border-dashed">
                                    <File className="h-12 w-12 mb-2 opacity-20" />
                                    <p className="text-sm font-medium opacity-60">Tidak ada file lampiran.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: TRACKING */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-6">
                            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b">
                                <Clock className="h-4 w-4 text-orange-500" /> Riwayat Perjalanan
                            </h3>

                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                                {surat.log_trackings && surat.log_trackings.map((log: any, index: number) => (
                                    <div key={log.id} className="relative pl-8 group">
                                        <div className="absolute -left-[9px] top-0 bg-white p-1 rounded-full border border-gray-200 group-hover:border-blue-300 transition-colors">
                                            {getTrackingIcon(log.aksi)}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 font-bold">
                                                {new Date(log.waktu_aksi).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', year:'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 capitalize">
                                                {log.aksi.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <UserIcon className="h-3 w-3" /> {log.user?.name || 'Sistem'}
                                            </span>
                                            {log.keterangan && (
                                                <div className="mt-2 text-xs text-gray-600 bg-amber-50/50 p-2 rounded border border-amber-100/50 italic">
                                                    "{log.keterangan}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!surat.log_trackings || surat.log_trackings.length === 0) && (
                                    <p className="text-xs text-gray-400 pl-8 italic">Belum ada riwayat tercatat.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SuratFormModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                editingData={surat}
            />

            <DisposisiModal
                isOpen={isDisposisiOpen}
                onClose={() => setIsDisposisiOpen(false)}
                surat={surat}
            />

        </AppLayout>
    );
}
