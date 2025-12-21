import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    recents: any[];
}

export default function DashboardRecent({ recents }: Props) {
    return (
        <Card className="shadow-sm h-fit border-t-4 border-t-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" /> Surat Masuk Terbaru
                </CardTitle>
                <Link href="/surat-masuk" className="text-xs text-blue-600 hover:underline">
                    Lihat Semua
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {recents.length > 0 ? recents.map((surat: any) => (
                        <Link key={surat.id} href={`/surat-masuk/${surat.id}`} className="block p-4 hover:bg-slate-50 transition group">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${surat.status_surat === 'baru'
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-green-50 text-green-600 border-green-100'
                                    }`}>
                                    {surat.status_surat === 'baru' ? 'Baru' : 'Didisposisi'}
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                                    {new Date(surat.tgl_terima).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            <p className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                {surat.perihal}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{surat.pengirim}</p>
                        </Link>
                    )) : (
                        <div className="p-6 text-center text-gray-400 text-xs">Belum ada surat masuk.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
