import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, FileSpreadsheet, CalendarRange } from 'lucide-react';

export default function LaporanIndex() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const [tglAwal, setTglAwal] = useState(firstDay.toISOString().split('T')[0]);
    const [tglAkhir, setTglAkhir] = useState(today.toISOString().split('T')[0]);

    const handlePrint = () => {
        const url = `/laporan/cetak?tgl_awal=${tglAwal}&tgl_akhir=${tglAkhir}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Laporan', href: '/laporan' }]}>
            <Head title="Pusat Laporan" />

            <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Pusat Laporan & Arsip</h2>
                    <p className="text-muted-foreground">
                        Cetak Buku Agenda Surat Masuk berdasarkan periode tanggal tertentu.
                    </p>
                </div>

                <Card className="border-l-4 border-l-blue-600 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarRange className="h-5 w-5 text-blue-600" />
                            Laporan Surat Masuk
                        </CardTitle>
                        <CardDescription>
                            Pilih rentang tanggal penerimaan surat untuk dicetak.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Dari Tanggal</Label>
                                <Input
                                    type="date"
                                    value={tglAwal}
                                    onChange={(e) => setTglAwal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sampai Tanggal</Label>
                                <Input
                                    type="date"
                                    value={tglAkhir}
                                    onChange={(e) => setTglAkhir(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                            <Button onClick={handlePrint} className="flex-1 bg-blue-700 hover:bg-blue-800">
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak PDF / Print
                            </Button>

                            <Button variant="outline" className="flex-1" disabled>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export Excel (Coming Soon)
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <strong>Catatan:</strong><br/>
                    Pastikan menonaktifkan "Pop-up Blocker" agar jendela cetak bisa terbuka otomatis.
                </div>
            </div>
        </AppLayout>
    );
}
