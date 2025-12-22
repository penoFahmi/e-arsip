import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Send, Calendar, Printer, FileText, Paperclip, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { SuratData } from '../types';

interface Props {
    data: SuratData[];
    onEdit: (surat: SuratData) => void;
    onDelete: (id: number) => void;
    onDisposisi: (surat: SuratData) => void;
}

export default function SuratList({ data, onEdit, onDelete, onDisposisi }: Props) {

    const getSifatBadge = (sifat: string) => {
        switch (sifat) {
            case 'rahasia': return <Badge variant="destructive" className="uppercase text-[10px]">Rahasia</Badge>;
            case 'penting': return <Badge className="bg-orange-500 hover:bg-orange-600 uppercase text-[10px]">Penting</Badge>;
            default: return <Badge variant="secondary" className="uppercase text-[10px] bg-slate-200 text-slate-700">Biasa</Badge>;
        }
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                <div className="bg-muted p-4 rounded-full mb-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Belum ada surat masuk</h3>
                <p className="text-sm text-muted-foreground mt-1">Surat yang diinput akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <>
            {/* --- TAMPILAN DESKTOP (Tabel) --- */}
            <div className="hidden md:block rounded-xl border border-sidebar-border/70 overflow-hidden bg-background shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[140px]">Agenda</TableHead>
                            <TableHead className="w-[180px]">Info Surat</TableHead>
                            <TableHead>Perihal & Pengirim</TableHead>
                            <TableHead className="w-[100px] text-center">Sifat</TableHead>
                            <TableHead className="w-[80px] text-center">File</TableHead>
                            <TableHead className="w-[120px] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((surat) => (
                            <TableRow key={surat.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="align-top font-mono text-xs font-medium">
                                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block border border-blue-100">
                                        {surat.no_agenda}
                                    </div>
                                    <div className="mt-1 text-[10px] text-muted-foreground">
                                        Masuk: {surat.tgl_terima}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="font-semibold text-sm text-foreground">{surat.no_surat}</div>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" /> {surat.tgl_surat}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top">
                                    <div className="line-clamp-2 font-medium text-sm leading-snug mb-1">
                                        {surat.perihal}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="font-semibold text-foreground/70">Dari:</span> {surat.pengirim}
                                    </div>
                                </TableCell>

                                <TableCell className="align-top text-center">
                                    {getSifatBadge(surat.sifat_surat)}
                                </TableCell>

                                <TableCell className="align-top text-center">
                                    {surat.file_scan && surat.file_scan.length > 0 ? (
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                            <a href={`/storage/${surat.file_scan[0].path_file}`} target="_blank" title="Lihat PDF">
                                                <Paperclip className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    ) : <span className="text-muted-foreground/30 text-lg">&bull;</span>}
                                </TableCell>

                                <TableCell className="align-top text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={() => onDisposisi(surat)} title="Disposisi"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/surat-masuk/${surat.id}`} className="cursor-pointer">
                                                        <Eye className="mr-2 h-3.5 w-3.5" /> Detail Lengkap
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                     <a href={`/surat-masuk/${surat.id}/cetak-disposisi`} target="_blank" className="cursor-pointer">
                                                        <Printer className="mr-2 h-3.5 w-3.5" /> Cetak Lembar Disposisi
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onEdit(surat)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Data
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(surat.id)} className="text-red-600 focus:text-red-600 cursor-pointer">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus Surat
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
                {data.map((surat) => (
                    <Card key={surat.id} className="border-l-4 border-l-blue-600 shadow-sm overflow-hidden relative">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {surat.no_agenda}
                                    </div>
                                    {getSifatBadge(surat.sifat_surat)}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                             <a href={`/surat-masuk/${surat.id}/cetak-disposisi`} target="_blank" className="cursor-pointer">
                                                <Printer className="mr-2 h-3.5 w-3.5" /> Cetak Disposisi
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onEdit(surat)} className="cursor-pointer">
                                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Data
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(surat.id)} className="text-red-600 focus:text-red-600 cursor-pointer">
                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus Surat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-2 pr-6"> 
                                <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                                    {surat.perihal}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <span className="truncate max-w-[150px] font-medium">{surat.pengirim}</span>
                                    <span>&bull;</span>
                                    <span>{surat.tgl_surat}</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-0">
                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-dashed">
                                {surat.file_scan && surat.file_scan.length > 0 && (
                                    <Badge variant="outline" className="text-[10px] gap-1 pl-1 pr-2">
                                        <Paperclip className="h-3 w-3" /> Ada Lampiran
                                    </Badge>
                                )}
                                <span className="text-[10px] text-gray-400 ml-auto font-mono">
                                    No: {surat.no_surat}
                                </span>
                            </div>
                        </CardContent>

                        <CardFooter className="p-2 bg-gray-50 flex justify-between gap-2 border-t">
                             <Button variant="outline" size="sm" className="h-8 text-xs flex-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => onDisposisi(surat)}>
                                <Send className="mr-1.5 h-3 w-3" /> Disposisi
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs flex-1" asChild>
                                <Link href={`/surat-masuk/${surat.id}`}>Lihat Detail</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}
