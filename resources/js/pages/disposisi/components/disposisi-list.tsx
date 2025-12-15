import { Clock, FileText, User as UserIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { DisposisiData } from '../types';

interface Props {
    data: DisposisiData[];
    onUpdateClick: (item: DisposisiData) => void;
}

export default function DisposisiList({ data, onUpdateClick }: Props) {

    // Badge Status Pengerjaan
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'terkirim': return <Badge variant="secondary">Baru</Badge>;
            case 'dibaca': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Dibaca</Badge>;
            case 'tindak_lanjut': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Proses</Badge>;
            case 'selesai': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Selesai</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    // [BARU] Badge Sifat Disposisi (Penting/Segera)
    const getSifatBadge = (sifat: string) => {
        switch (sifat) {
            case 'sangat_segera': return <Badge variant="destructive" className="animate-pulse">SANGAT SEGERA</Badge>;
            case 'segera': return <Badge className="bg-orange-500 hover:bg-orange-600">SEGERA</Badge>;
            case 'rahasia': return <Badge className="bg-purple-600 hover:bg-purple-700">RAHASIA</Badge>;
            default: return <Badge variant="outline" className="text-gray-500 border-gray-300">Biasa</Badge>;
        }
    };

    if (data.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-white border border-dashed rounded-xl">
                Belum ada disposisi masuk untuk Anda.
            </div>
        );
    }

    return (
        // RESPONSIVE: 1 Kolom di HP, 2 Kolom di Laptop (lg)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.map((item) => (
                <div key={item.id} className={`flex flex-col gap-3 p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${item.status_disposisi === 'terkirim' ? 'bg-white border-blue-300 ring-1 ring-blue-100' : 'bg-white border-gray-200'}`}>

                    {/* Header Card: Sifat & Tanggal */}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                            {getSifatBadge(item.sifat_disposisi)}
                            {item.status_disposisi === 'terkirim' && <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.tgl_disposisi}
                        </div>
                    </div>

                    {/* Info Surat */}
                    <div className="pb-3 border-b border-dashed border-gray-100">
                        <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2" title={item.surat.perihal}>
                            {item.surat.perihal}
                        </h3>
                        <div className="text-xs text-gray-500">
                            {item.surat.no_surat} • Dari: {item.surat.pengirim}
                        </div>
                    </div>

                    {/* Isi Instruksi */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
                        {/* Jika ada Parent (Disposisi Berantai) */}
                        {item.parent && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1 italic">
                                <span>{item.parent.dari_user.name}</span>
                                <ArrowRight className="h-3 w-3" />
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-700 mr-1">{item.dari_user.name}:</span>
                                <span className="text-gray-600 italic">"{item.instruksi}"</span>
                            </div>
                        </div>

                        {item.batas_waktu && (
                            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                                <AlertTriangle className="h-3 w-3" /> Batas Waktu: {item.batas_waktu}
                            </div>
                        )}
                    </div>

                    {/* Footer: Status & Action */}
                    <div className="flex items-center justify-between pt-2">
                        {getStatusBadge(item.status_disposisi)}

                        <div className="flex gap-2">
                            {item.surat.file_scan?.[0] && (
                                <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                    <a href={`/storage/${item.surat.file_scan[0].path_file}`} target="_blank">
                                        <FileText className="h-3 w-3 mr-1" /> File
                                    </a>
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant={item.status_disposisi === 'selesai' ? 'outline' : 'default'}
                                onClick={() => onUpdateClick(item)}
                                className="h-8 text-xs"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {item.status_disposisi === 'selesai' ? 'Detail' : 'Tindak Lanjut'}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
