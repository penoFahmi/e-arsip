import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import {
    ArrowLeft, Calendar, FileText, User as UserIcon,
    Clock, CheckCircle, Send, AlertCircle, File
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props extends PageProps {
    surat: any; // Menggunakan any agar fleksibel dengan relasi yg banyak
}

export default function SuratMasukShow({ surat }: Props) {

    // Helper Icon Tracking
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

            <div className="flex flex-col gap-6 p-4">

                {/* Header Back */}
                <div>
                    <Link href="/surat-masuk">
                        <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* KOLOM KIRI: Detail & File (2/3 layar) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Kartu Detail */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-xl font-bold text-gray-900">{surat.perihal}</h1>
                                <Badge variant="outline" className="capitalize">{surat.sifat_surat}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Nomor Surat</p>
                                    <p className="font-medium text-gray-900">{surat.no_surat}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Pengirim / Asal</p>
                                    <p className="font-medium text-gray-900">{surat.pengirim}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Tanggal Surat</p>
                                    <p className="font-medium text-gray-900">{surat.tgl_surat}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Tanggal Diterima</p>
                                    <p className="font-medium text-gray-900">{surat.tgl_terima}</p>
                                </div>
                            </div>

                            {surat.ringkasan && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Ringkasan</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-dashed text-sm">
                                        {surat.ringkasan}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview File */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm h-[600px] flex flex-col">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <File className="h-4 w-4" /> Lampiran Surat
                            </h3>

                            {surat.file_scan && surat.file_scan.length > 0 ? (
                                <iframe
                                    src={`/storage/${surat.file_scan[0].path_file}`}
                                    className="w-full h-full rounded-lg border bg-gray-100"
                                    title="Preview File"
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                                    <File className="h-12 w-12 mb-2 opacity-50" />
                                    <p>Tidak ada file lampiran.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Timeline Tracking (1/3 layar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-6">
                            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Riwayat Perjalanan
                            </h3>

                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                                {surat.log_trackings && surat.log_trackings.map((log: any, index: number) => (
                                    <div key={log.id} className="relative pl-8">
                                        {/* Dot Indikator */}
                                        <div className="absolute -left-[9px] top-0 bg-white p-1 rounded-full border border-gray-200">
                                            {getTrackingIcon(log.aksi)}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 mb-0.5">
                                                {new Date(log.waktu_aksi).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 capitalize">
                                                {log.aksi.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                Oleh: <span className="text-gray-700 font-medium">{log.user?.name || 'Sistem'}</span>
                                            </span>
                                            {log.keterangan && (
                                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                                    {log.keterangan}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {(!surat.log_trackings || surat.log_trackings.length === 0) && (
                                    <p className="text-xs text-gray-400 pl-8">Belum ada riwayat.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
