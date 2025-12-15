import { Pencil, Trash2, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BidangData } from '../types';

interface Props {
    data: BidangData[];
    onEdit: (bidang: BidangData) => void;
    onDelete: (id: number) => void;
}

export default function BidangList({ data, onEdit, onDelete }: Props) {
    if (data.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-background">Belum ada data bidang.</div>;
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                        <th className="px-6 py-3 font-medium">Kode</th>
                        <th className="px-6 py-3 font-medium">Nama Bidang</th>
                        <th className="px-6 py-3 font-medium text-center">Jumlah Pegawai</th>
                        <th className="px-6 py-3 font-medium text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((bidang) => (
                        <tr key={bidang.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">
                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">
                                    {bidang.kode}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                {bidang.nama_bidang}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                    <Users className="h-3 w-3" /> {bidang.users_count || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(bidang)} title="Edit">
                                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(bidang.id)} title="Hapus">
                                        <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
