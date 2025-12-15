import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import komponen pecahan
import { UserData, BidangOption } from './types';
import UserList from './components/user-list';
import UserFormModal from './components/user-form-modal';

interface Props extends PageProps {
    users: { data: UserData[]; links: any[]; from: number };
    bidangs: BidangOption[];
    filters: { search: string };
}

export default function UserIndex({ users, bidangs, filters }: Props) {
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
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Manajemen User', href: '/users' }]}>
            <Head title="Manajemen User" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Data Pegawai</h2>
                        <p className="text-sm text-muted-foreground">Kelola akun dan hak akses pengguna sistem.</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8 bg-background"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreateModal} className="shrink-0">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Tambah</span>
                            <span className="md:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* Content List */}
                <UserList
                    data={users.data}
                    onEdit={openEditModal}
                    onDelete={deleteUser}
                />

                {/* Modal Form */}
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingData={editingUser}
                    bidangs={bidangs}
                />

            </div>
        </AppLayout>
    );
}
