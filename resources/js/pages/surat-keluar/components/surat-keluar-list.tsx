import { Link } from '@inertiajs/react';
import { Pencil, Trash2, Calendar, Camera, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { SuratKeluarData } from '../types';

interface Props {
    data: SuratKeluarData[];
    onEdit: (surat: SuratKeluarData) => void;
    onDelete: (id: number) => void;
    onUploadBukti: (surat: SuratKeluarData) => void;
}

export default function SuratKeluarList({ data, onEdit, onDelete, onUploadBukti }: Props) {

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Draft / Konsep</Badge>;
            case 'kirim': return <Badge className="bg-orange-500 hover:bg-orange-600 animate-pulse">Sedang Dikirim</Badge>;
            case 'diterima': return <Badge className="bg-green-600 hover:bg-green-700">Diterima</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    if (data.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-background">Belum ada surat keluar.</div>;
    }

    return (
        <>
            <div className="hidden md:block rounded-xl border overflow-hidden bg-background">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[150px]">Agenda</TableHead>
                            <TableHead>Tujuan & Perihal</TableHead>
                            <TableHead>Tgl Surat</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((surat) => (
                            <TableRow key={surat.id}>
                                <TableCell className="align-top">
                                    <div className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit text-xs border border-blue-100">
                                        {surat.no_agenda}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        {surat.no_surat || 'No. Surat Belum Ada'}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="font-semibold text-sm text-gray-900">{surat.tujuan}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{surat.perihal}</div>
                                </TableCell>

                                <TableCell className="align-top text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {surat.tgl_surat}
                                    </div>
                                </TableCell>

                                <TableCell className="text-center align-top">
                                    {getStatusBadge(surat.status_surat)}
                                </TableCell>

                                <TableCell className="text-right align-top">
                                    <div className="flex justify-end gap-1">
                                        {/* Jika status DRAFT: Bisa Edit & Hapus */}
                                        {surat.status_surat === 'draft' && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onEdit(surat)} title="Edit Draft">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onDelete(surat.id)} title="Hapus">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}

                                        {/* Jika status KIRIM: Tombol Upload Bukti (Kamera) */}
                                        {surat.status_surat === 'kirim' && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 text-xs bg-orange-500 hover:bg-orange-600"
                                                onClick={() => onUploadBukti(surat)}
                                            >
                                                <Camera className="h-3.5 w-3.5 mr-1" /> Bukti Sampai
                                            </Button>
                                        )}

                                        {/* Jika status DITERIMA: Tombol Lihat Bukti */}
                                        {surat.status_surat === 'diterima' && surat.file_bukti && (
                                            <Button variant="outline" size="sm" className="h-8 text-xs text-green-700 border-green-200 bg-green-50" asChild>
                                                <a href={`/storage/${surat.file_bukti}`} target="_blank">
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Lihat Tanda Terima
                                                </a>
                                            </Button>
                                        )}

                                        {/* File Surat Asli (PDF) jika ada */}
                                        {surat.file_surat && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" asChild>
                                                <a href={`/storage/${surat.file_surat}`} target="_blank" title="Lihat Surat Asli">
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE VIEW (CARD) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
                {data.map((surat) => (
                    <Card key={surat.id} className={`border-l-4 shadow-sm ${surat.status_surat === 'diterima' ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                        <CardHeader className="pb-2 p-4">
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {surat.no_agenda}
                                </span>
                                {getStatusBadge(surat.status_surat)}
                            </div>
                            <div className="mt-2">
                                <div className="text-xs text-muted-foreground uppercase font-bold">Kepada:</div>
                                <div className="font-semibold text-sm text-gray-900">{surat.tujuan}</div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-0 text-sm text-gray-600 line-clamp-2">
                            {surat.perihal}
                        </CardContent>

                        <CardFooter className="p-3 bg-gray-50 flex justify-end gap-2 border-t">
                            {surat.status_surat === 'draft' ? (
                                <>
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onEdit(surat)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => onDelete(surat.id)}>Hapus</Button>
                                </>
                            ) : surat.status_surat === 'kirim' ? (
                                <Button size="sm" className="h-8 w-full bg-orange-500 hover:bg-orange-600" onClick={() => onUploadBukti(surat)}>
                                    <Camera className="mr-2 h-4 w-4" /> Upload Bukti
                                </Button>
                            ) : (
                                // Diterima
                                <div className="flex gap-2 w-full">
                                    {surat.file_bukti && (
                                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-green-300 text-green-700" asChild>
                                            <a href={`/storage/${surat.file_bukti}`} target="_blank">Bukti</a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}
