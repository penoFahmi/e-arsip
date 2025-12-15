import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserData } from '../types';

interface Props {
    data: UserData[];
    onEdit: (user: UserData) => void;
    onDelete: (id: number) => void;
}

export default function UserList({ data, onEdit, onDelete }: Props) {
    if (data.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-background">Tidak ada data pegawai.</div>;
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                        <th className="px-6 py-3 font-medium">Pegawai</th>
                        <th className="px-6 py-3 font-medium">Role</th>
                        <th className="px-6 py-3 font-medium">Bidang</th>
                        <th className="px-6 py-3 font-medium text-center">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="secondary" className="capitalize">
                                    {user.role.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {user.bidang?.nama_bidang || '-'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Badge variant={user.status_aktif ? "default" : "destructive"} className="text-[10px] px-2 py-0">
                                    {user.status_aktif ? 'Aktif' : 'Non-Aktif'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(user)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
