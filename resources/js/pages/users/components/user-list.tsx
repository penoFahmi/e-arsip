import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2, Filter, X, Shield, Building2 } from 'lucide-react';
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
    from: number; // [BARU] Untuk nomor urut
    onEdit: (user: UserData) => void;
    onDelete: (id: number) => void;
    filters: { role?: string; status?: string; };
    roleLabels: Record<string, string>;
}

export default function UserList({ data, from, onEdit, onDelete, filters, roleLabels }: Props) {
    const [filterRole, setFilterRole] = useState(filters.role || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');

    const applyFilter = (key: string, value: string) => {
        const newFilters = {
            role: key === 'role' ? value : filterRole,
            status: key === 'status' ? value : filterStatus,
        };
        if (key === 'role') setFilterRole(value);
        if (key === 'status') setFilterStatus(value);
        router.get('/users', newFilters, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setFilterRole('');
        setFilterStatus('');
        router.get('/users', {}, { preserveState: true });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 border-dashed shrink-0">
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
                        <DropdownMenuLabel>Level Akses</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['super_admin', 'level_1', 'level_2', 'level_3', 'staf'].map((role) => (
                            <DropdownMenuCheckboxItem
                                key={role}
                                checked={filterRole === role}
                                onCheckedChange={() => applyFilter('role', filterRole === role ? '' : role)}
                            >
                                {roleLabels[`label_${role}`] || role.replace('_', ' ').toUpperCase()}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem checked={filterStatus === '1'} onCheckedChange={() => applyFilter('status', filterStatus === '1' ? '' : '1')}>Aktif</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterStatus === '0'} onCheckedChange={() => applyFilter('status', filterStatus === '0' ? '' : '0')}>Non-Aktif</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {(filterRole || filterStatus) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 lg:px-3 text-destructive hover:text-destructive">
                        Reset <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tabel Data */}
            <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-12 text-center">No</th>
                            <th className="px-4 py-3">Pegawai</th>
                            {/* Hidden di HP, Muncul di Tablet/Desktop */}
                            <th className="hidden md:table-cell px-4 py-3">Jabatan & Role</th>
                            <th className="hidden lg:table-cell px-4 py-3">Unit Kerja</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.length > 0 ? (
                            data.map((user, index) => (
                                <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                                    {/* Kolom No Urut */}
                                    <td className="px-4 py-4 text-center text-xs text-muted-foreground font-mono">
                                        {(from || 1) + index}
                                    </td>

                                    {/* Kolom Informasi Utama (Pegawai) */}
                                    <td className="px-4 py-4 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground text-sm">{user.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono mb-1">{user.username}</span>

                                            {/* [MOBILE ONLY] Info Jabatan & Unit muncul disini kalau di HP */}
                                            <div className="md:hidden space-y-1 mt-1 border-t pt-1 border-dashed">
                                                <div className="text-[10px] text-gray-600 flex items-center gap-1">
                                                    <Shield className="h-3 w-3 text-primary/70" />
                                                    {user.jabatan || '-'}
                                                </div>
                                                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Building2 className="h-3 w-3 text-gray-400" />
                                                    {user.bidang?.nama_bidang || 'Unit Utama'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Kolom Jabatan (Desktop Only) */}
                                    <td className="hidden md:table-cell px-4 py-4 align-top">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-medium text-foreground">{user.jabatan || '-'}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-slate-50 text-slate-600 border-slate-200">
                                                    {roleLabels[`label_${user.role}`] || user.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Kolom Unit (Desktop Only) */}
                                    <td className="hidden lg:table-cell px-4 py-4 align-top">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                            {user.bidang?.nama_bidang || <span className="text-orange-600/70 italic">Unit Utama / Pimpinan</span>}
                                        </div>
                                    </td>

                                    {/* Kolom Status */}
                                    <td className="px-4 py-4 text-center align-top">
                                        <Badge
                                            variant={user.status_aktif ? "default" : "destructive"}
                                            className={`text-[10px] px-2 py-0.5 shadow-none ${user.status_aktif ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                        >
                                            {user.status_aktif ? 'Aktif' : 'Non-Aktif'}
                                        </Badge>
                                    </td>

                                    {/* Kolom Aksi */}
                                    <td className="px-4 py-4 text-right align-top">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Data
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus Pegawai
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="p-3 bg-muted rounded-full">
                                            <Filter className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p>Tidak ada pegawai ditemukan.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
