import { useState, FormEventHandler } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

// Import Komponen Bawaan Starter Kit (Shadcn UI)
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tipe Data
interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    jabatan?: string;
    no_hp?: string;
    id_bidang?: number;
    status_aktif: boolean;
    bidang?: { id: number; nama_bidang: string };
}

interface UserIndexProps extends PageProps {
    users: { data: UserData[]; links: any[]; from: number };
    bidangs: { id: number; nama_bidang: string }[];
    filters: { search: string };
}

export default function UserIndex({ users, bidangs, filters }: UserIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '', // Field baru untuk konfirmasi
        role: 'staf',
        id_bidang: '',
        jabatan: '',
        no_hp: '',
        status_aktif: true,
    });

    // Handle Search
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/users', { search }, { preserveState: true });
        }
    };

    // Buka Modal Create
    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Buka Modal Edit
    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            password_confirmation: '', // Reset konfirmasi saat edit
            role: user.role,
            id_bidang: user.id_bidang ? String(user.id_bidang) : '',
            jabatan: user.jabatan || '',
            no_hp: user.no_hp || '',
            status_aktif: Boolean(user.status_aktif),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Submit Form
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => setIsModalOpen(false) };

        if (editingUser) {
            put(`/users/${editingUser.id}`, options);
        } else {
            post('/users', options);
        }
    };

    const deleteUser = (id: number) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            router.delete(`/users/${id}`);
        }
    };

    // Breadcrumbs Style Bawaan
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen User', href: '/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header Page */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            Data Pegawai
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun dan hak akses pengguna sistem.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreateModal}>
                            <Plus className="h-4 w-4 mr-2" /> Tambah
                        </Button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden bg-background">
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
                            {users.data.map((user) => (
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
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.data.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            Tidak ada data pegawai ditemukan.
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DIALOG */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
                        <DialogDescription>
                            Isi informasi pegawai di bawah ini. Klik simpan untuk perubahan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={data.username} onChange={e => setData('username', e.target.value)} required />
                                <InputError message={errors.username} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Fields - Updated */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password {editingUser && '(Opsional)'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder={editingUser ? "Kosongkan jika tetap" : "Min. 8 karakter"}
                                    required={!editingUser}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Pass</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder={editingUser ? "Kosongkan jika tetap" : "Ulangi Password"}
                                    required={!editingUser}
                                />
                                {/* Error biasanya muncul di field password, tapi kita siapkan slot jika ada */}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                >
                                    <option value="staf">Staf</option>
                                    <option value="pimpinan">Pimpinan</option>
                                    <option value="admin_bidang">Admin Bidang</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_bidang">Bidang</Label>
                                <select
                                    id="id_bidang"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.id_bidang}
                                    onChange={e => setData('id_bidang', e.target.value)}
                                    disabled={data.role === 'super_admin'}
                                >
                                    <option value="">-- Pilih --</option>
                                    {bidangs.map(b => (
                                        <option key={b.id} value={b.id}>{b.nama_bidang}</option>
                                    ))}
                                </select>
                                <InputError message={errors.id_bidang} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                           <input
                                type="checkbox"
                                id="status_aktif"
                                checked={data.status_aktif}
                                onChange={e => setData('status_aktif', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                           />
                           <Label htmlFor="status_aktif">Akun Aktif</Label>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
