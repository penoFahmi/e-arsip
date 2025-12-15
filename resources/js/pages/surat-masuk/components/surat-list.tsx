// resources/js/pages/surat-masuk/components/surat-list.tsx
import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SuratData } from '../types';
import { Printer } from 'lucide-react';

interface Props {
    data: SuratData[];
    onEdit: (surat: SuratData) => void;
    onDelete: (id: number) => void;
    onDisposisi: (surat: SuratData) => void;
}

export default function SuratList({ data, onEdit, onDelete, onDisposisi }: Props) {
    const getBadgeColor = (sifat: string) => {
        if (sifat === 'rahasia') return 'destructive';
        if (sifat === 'penting') return 'default';
        return 'secondary';
    };

    if (data.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-background">Belum ada surat masuk.</div>;
    }

    return (
        <>
            {/* TAMPILAN DESKTOP (Table) - Hidden di Mobile */}
            <div className="hidden md:block rounded-xl border overflow-hidden bg-background">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>No. Agenda</TableHead>
                            <TableHead>No. Surat / Tgl</TableHead>
                            <TableHead>Pengirim / Perihal</TableHead>
                            <TableHead>Sifat</TableHead>
                            <TableHead className="text-center">File</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((surat) => (
                            <TableRow key={surat.id}>
                                <TableCell>
                                    <div className="font-semibold">{surat.no_agenda}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold">{surat.no_surat}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" /> {surat.tgl_surat}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[300px]">
                                    <div className="font-medium">{surat.pengirim}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{surat.perihal}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeColor(surat.sifat_surat)} className="capitalize">
                                        {surat.sifat_surat}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    {surat.file_scan && surat.file_scan.length > 0 ? (
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 bg-blue-50">
                                            <Link href={`/surat-masuk/${surat.id}`} title="Lihat">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDisposisi(surat)} title="Disposisi">
                                            <Send className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(surat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(surat.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <a
                                            href={`/surat-masuk/${surat.id}/cetak-disposisi`}
                                            target="_blank"
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                                            title="Cetak Lembar Disposisi"
                                        >
                                            <Printer className="h-4 w-4 text-gray-600" />
                                        </a>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* TAMPILAN MOBILE (Card) - Hidden di Desktop */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {data.map((surat) => (
                    <Card key={surat.id} className="bg-card">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={getBadgeColor(surat.sifat_surat)}>{surat.sifat_surat}</Badge>
                                <span className="text-xs text-muted-foreground">{surat.tgl_surat}</span>
                            </div>
                            <CardTitle className="text-base mt-2">{surat.pengirim}</CardTitle>
                            <div className="text-sm font-medium text-foreground/80">{surat.no_surat}</div>
                        </CardHeader>
                        <CardContent className="pb-3 text-sm text-muted-foreground line-clamp-2">
                            {surat.perihal}
                        </CardContent>
                        <CardFooter className="pt-2 border-t flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => onDisposisi(surat)}>
                                <Send className="mr-2 h-3 w-3" /> Disposisi
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(surat)}>Edit</Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/surat-masuk/${surat.id}`}>Detail</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}
