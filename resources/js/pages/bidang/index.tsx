import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import komponen pecahan
import { BidangData } from './types';
import BidangList from './components/bidang-list';
import BidangFormModal from './components/bidang-form-modal';

interface Props extends PageProps {
    bidangs: { data: BidangData[]; links: any[] };
    filters: { search: string };
}

export default function BidangIndex({ bidangs, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBidang, setEditingBidang] = useState<BidangData | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/bidang', { search }, { preserveState: true });
        }
    };

    const openCreateModal = () => {
        setEditingBidang(null);
        setIsModalOpen(true);
    };

    const openEditModal = (bidang: BidangData) => {
        setEditingBidang(bidang);
        setIsModalOpen(true);
    };

    const deleteBidang = (id: number) => {
        if (confirm('Yakin hapus bidang ini? Data user terkait mungkin akan terpengaruh.')) {
            router.delete(`/bidang/${id}`);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Bidang', href: '/bidang' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Bidang" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Master Bidang</h2>
                        <p className="text-sm text-muted-foreground">Kelola unit kerja / divisi instansi.</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari bidang..."
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
                <BidangList
                    data={bidangs.data}
                    onEdit={openEditModal}
                    onDelete={deleteBidang}
                />

                {/* Modal Form */}
                <BidangFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingData={editingBidang}
                />

            </div>
        </AppLayout>
    );
}
