import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react'; // Gunakan router untuk filter
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, BookOpen, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
    surats: { data: any[]; links: any[] };
    filters: { tgl_awal: string; tgl_akhir: string; search: string };
}

export default function LaporanMasuk({ surats, filters }: Props) {
    const [tglAwal, setTglAwal] = useState(filters.tgl_awal);
    const [tglAkhir, setTglAkhir] = useState(filters.tgl_akhir);
    const [search, setSearch] = useState(filters.search || '');

    // Fungsi refresh data tabel saat filter berubah
    const handleFilter = () => {
        router.get('/laporan/surat-masuk', { tgl_awal: tglAwal, tgl_akhir: tglAkhir, search }, { preserveState: true, preserveScroll: true });
    };

    const handlePrint = () => {
        window.open(`/laporan/surat-masuk/cetak?tgl_awal=${tglAwal}&tgl_akhir=${tglAkhir}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan', href: '#' }, { title: 'Agenda Masuk', href: '#' }]}>
            <Head title="Laporan Surat Masuk" />

            <div className="p-4 md:p-8 space-y-6">

                {/* 1. FILTER & CETAK CARD */}
                <Card className="border-l-4 border-l-blue-600 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Filter & Cetak Agenda Masuk
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
                                        placeholder="No Surat / Pengirim..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <Button onClick={handleFilter} variant="secondary">Tampilkan</Button>
                            <Button onClick={handlePrint} className="bg-blue-700 hover:bg-blue-800 ml-auto">
                                <Printer className="mr-2 h-4 w-4" /> Cetak PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. PREVIEW TABEL (Biar Gak Kosong) */}
                <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Nomor / Tanggal Surat</TableHead>
                                <TableHead>Asal Surat</TableHead>
                                <TableHead>Perihal</TableHead>
                                <TableHead>Disposisi (User)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {surats.data.length > 0 ? (
                                surats.data.map((surat, i) => (
                                    <TableRow key={surat.id}>
                                        <TableCell className="text-center">{i + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{surat.no_surat}</div>
                                            <div className="text-xs text-muted-foreground">{surat.tgl_surat}</div>
                                        </TableCell>
                                        <TableCell>{surat.pengirim}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={surat.perihal}>{surat.perihal}</TableCell>
                                        <TableCell>
                                            {/* Logic Tampilkan Nama User Disposisi */}
                                            {surat.disposisi && surat.disposisi.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {surat.disposisi.map((d: any, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px]">
                                                            {d.ke_user?.jabatan || d.ke_user?.name || '-'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
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
