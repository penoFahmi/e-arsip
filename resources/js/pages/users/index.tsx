// resources/js/pages/users/index.tsx

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Plus, Search, Users } from 'lucide-react'; // Icon baru

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { UserData, BidangOption } from './types';
import UserList from './components/user-list';
import UserFormModal from './components/user-form-modal';

interface Props extends PageProps {
    users: {
        data: UserData[];
        links: any[];
        from: number; // [PENTING] Ini data dari Laravel Pagination
        total: number;
    };
    bidangs: BidangOption[];
    roleLabels: Record<string, string>;
    filters: { search: string; role?: string; status?: string };
}

export default function UserIndex({ users, bidangs, roleLabels, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/users', { search }, { preserveState: true });
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const deleteUser = (id: number) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            router.delete(`/users/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Manajemen Pegawai', href: '/users' }]}>
            <Head title="Manajemen Pegawai" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 bg-muted/10">

                {/* Header Section dengan Info Total */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Data Pegawai
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Total {users.total} pegawai terdaftar di sistem.
                        </p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari nama / NIP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-9 bg-background shadow-sm"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreateModal} className="shrink-0 shadow-md shadow-primary/20">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Tambah Pegawai</span>
                            <span className="md:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* List View */}
                <UserList
                    data={users.data}
                    from={users.from} // [PENTING] Kirim prop ini agar nomor urut benar
                    onEdit={openEditModal}
                    onDelete={deleteUser}
                    filters={filters}
                    roleLabels={roleLabels}
                />

                {/* Pagination Controls (Opsional jika ingin tombol Next/Prev sederhana) */}
                {/* Biasanya Inertia Link bisa ditaruh disini jika mau custom pagination */}

                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingData={editingUser}
                    bidangs={bidangs}
                    roleLabels={roleLabels}
                />
            </div>
        </AppLayout>
    );
}
