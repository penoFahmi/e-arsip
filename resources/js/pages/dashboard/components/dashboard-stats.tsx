import { FileText, Inbox, Users, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    stats: {
        total_surat: number;
        surat_bulan_ini: number;
        belum_disposisi?: number;
        total_user?: number;
        disposisi_masuk?: number;
    };
    isSuperAdmin: boolean;
}

export default function DashboardStats({ stats, isSuperAdmin }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-blue-100 bg-blue-50/50">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total Surat</p>
                        <h3 className="text-2xl font-bold mt-1 text-blue-700">{stats.total_surat}</h3>
                    </div>
                    <div className="p-3 bg-white text-blue-600 rounded-full shadow-sm"><Inbox className="h-5 w-5" /></div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-purple-100 bg-purple-50/50">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Bulan Ini</p>
                        <h3 className="text-2xl font-bold mt-1 text-purple-700">{stats.surat_bulan_ini}</h3>
                    </div>
                    <div className="p-3 bg-white text-purple-600 rounded-full shadow-sm"><FileText className="h-5 w-5" /></div>
                </CardContent>
            </Card>

            <Card className={`shadow-sm ${isSuperAdmin ? 'border-red-100 bg-red-50/50' : 'border-orange-100 bg-orange-50/50'}`}>
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">
                            {isSuperAdmin ? 'Belum Disposisi' : 'Tugas Baru'}
                        </p>
                        <h3 className={`text-2xl font-bold mt-1 ${isSuperAdmin ? 'text-red-700' : 'text-orange-700'}`}>
                            {isSuperAdmin ? stats.belum_disposisi : stats.disposisi_masuk}
                        </h3>
                    </div>
                    <div className="p-3 bg-white rounded-full shadow-sm">
                        {isSuperAdmin
                            ? <AlertCircle className="h-5 w-5 text-red-600" />
                            : <Clock className="h-5 w-5 text-orange-600" />
                        }
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-green-100 bg-green-50/50">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Pegawai Aktif</p>
                        <h3 className="text-2xl font-bold mt-1 text-green-700">{stats.total_user || 0}</h3>
                    </div>
                    <div className="p-3 bg-white text-green-600 rounded-full shadow-sm"><Users className="h-5 w-5" /></div>
                </CardContent>
            </Card>
        </div>
    );
}
