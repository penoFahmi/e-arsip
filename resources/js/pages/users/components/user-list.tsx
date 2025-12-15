import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserData } from '../types';

interface Props {
    data: UserData[];
    onEdit: (user: UserData) => void;
    onDelete: (id: number) => void;
    filters: {
        role?: string;
        status?: string;
    };
    roleLabels: Record<string, string>; // Untuk label filter
}

export default function UserList({ data, onEdit, onDelete, filters, roleLabels }: Props) {
    const [filterRole, setFilterRole] = useState(filters.role || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');

    // Fungsi Trigger Filter ke Backend
    const applyFilter = (key: string, value: string) => {
        const newFilters = {
            role: key === 'role' ? value : filterRole,
            status: key === 'status' ? value : filterStatus,
        };

        // Update state lokal
        if (key === 'role') setFilterRole(value);
        if (key === 'status') setFilterStatus(value);

        // Reload halaman dengan parameter baru
        router.get('/users', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setFilterRole('');
        setFilterStatus('');
        router.get('/users', {}, { preserveState: true });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar Filter */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                            {(filterRole || filterStatus) && (
                                <Badge variant="secondary" className="ml-2 px-1 font-normal">
                                    {(filterRole ? 1 : 0) + (filterStatus ? 1 : 0)}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Filter Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={filterRole === 'super_admin'}
                            onCheckedChange={() => applyFilter('role', filterRole === 'super_admin' ? '' : 'super_admin')}
                        >
                            Super Admin
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={filterRole === 'level_1'}
                            onCheckedChange={() => applyFilter('role', filterRole === 'level_1' ? '' : 'level_1')}
                        >
                            {roleLabels['label_level_1'] || 'Level 1'}
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={filterRole === 'level_2'}
                            onCheckedChange={() => applyFilter('role', filterRole === 'level_2' ? '' : 'level_2')}
                        >
                            {roleLabels['label_level_2'] || 'Level 2'}
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={filterRole === 'level_3'}
                            onCheckedChange={() => applyFilter('role', filterRole === 'level_3' ? '' : 'level_3')}
                        >
                            {roleLabels['label_level_3'] || 'Level 3'}
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={filterRole === 'staf'}
                            onCheckedChange={() => applyFilter('role', filterRole === 'staf' ? '' : 'staf')}
                        >
                            Staf (Pelaksana)
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status Akun</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={filterStatus === '1'}
                            onCheckedChange={() => applyFilter('status', filterStatus === '1' ? '' : '1')}
                        >
                            Aktif
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={filterStatus === '0'}
                            onCheckedChange={() => applyFilter('status', filterStatus === '0' ? '' : '0')}
                        >
                            Non-Aktif
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {(filterRole || filterStatus) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tabel Data */}
            <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium">Pegawai</th>
                            <th className="px-6 py-3 font-medium">Jabatan / Role</th>
                            <th className="px-6 py-3 font-medium">Unit Kerja</th>
                            <th className="px-6 py-3 font-medium text-center">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.length > 0 ? (
                            data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium">{user.jabatan || '-'}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            {/* Tampilkan Label Role yang Benar */}
                                            {roleLabels[`label_${user.role}`] || user.role.replace('_', ' ')}
                                        </div>
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Tidak ada data pegawai yang sesuai filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
