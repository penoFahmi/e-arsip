import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, BookOpen, Search } from 'lucide-react';

interface Props {
    surats: { data: any[]; links: any[] };
    filters: { tgl_awal: string; tgl_akhir: string; search: string };
}

export default function LaporanKeluar({ surats, filters }: Props) {
    const [tglAwal, setTglAwal] = useState(filters.tgl_awal);
    const [tglAkhir, setTglAkhir] = useState(filters.tgl_akhir);
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = () => {
        router.get('/laporan/surat-keluar', { tgl_awal: tglAwal, tgl_akhir: tglAkhir, search }, { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => {
        window.open(`/laporan/surat-keluar/cetak?tgl_awal=${tglAwal}&tgl_akhir=${tglAkhir}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan', href: '#' }, { title: 'Agenda Keluar', href: '#' }]}>
            <Head title="Laporan Surat Keluar" />

            <div className="p-4 md:p-8 space-y-6">

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-orange-600" />
                            Filter & Cetak Agenda Keluar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-1 w-full md:w-auto">
                                <Label>Dari Tanggal</Label>
                                <Input type="date" value={tglAwal} onChange={(e) => setTglAwal(e.target.value)} />
                            </div>
                            <div className="space-y-1 w-full md:w-auto">
                                <Label>Sampai Tanggal</Label>
                                <Input type="date" value={tglAkhir} onChange={(e) => setTglAkhir(e.target.value)} />
                            </div>
                            <div className="space-y-1 w-full md:w-64">
                                <Label>Cari Surat</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Tujuan / Perihal..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <Button onClick={handleFilter} variant="secondary">Tampilkan</Button>
                            <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 ml-auto">
                                <Printer className="mr-2 h-4 w-4" /> Cetak PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Nomor / Tanggal Surat</TableHead>
                                <TableHead>Asal Surat</TableHead>
                                <TableHead>Perihal</TableHead>
                                <TableHead>Disposisi (Tujuan)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {surats.data.length > 0 ? (
                                surats.data.map((surat, i) => (
                                    <TableRow key={surat.id}>
                                        <TableCell className="text-center">{i + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{surat.no_surat || surat.no_agenda}</div>
                                            <div className="text-xs text-muted-foreground">{surat.tgl_surat}</div>
                                        </TableCell>
                                        <TableCell>{surat.bidang ? surat.bidang.nama_bidang : 'Sekretariat'}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={surat.perihal}>{surat.perihal}</TableCell>
                                        <TableCell>{surat.tujuan}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colspan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data surat pada periode ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </AppLayout>
    );
}
