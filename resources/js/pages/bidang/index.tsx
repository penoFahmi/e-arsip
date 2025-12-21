import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Plus, Search, Layers } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BidangData } from './types';
import BidangList from './components/bidang-list';
import BidangFormModal from './components/bidang-form-modal';

interface Props extends PageProps {
    bidangs: BidangData[];
    filters: { search: string };
}

export default function BidangIndex({ bidangs, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBidang, setEditingBidang] = useState<BidangData | null>(null);
    const [selectedParent, setSelectedParent] = useState<{ id: number, nama: string } | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') router.get('/bidang', { search }, { preserveState: true });
    };

    const openCreateRootModal = () => {
        setEditingBidang(null);
        setSelectedParent(null);
        setIsModalOpen(true);
    };

    const openCreateSubModal = (parentId: number, parentName: string) => {
        setEditingBidang(null);
        setSelectedParent({ id: parentId, nama: parentName });
        setIsModalOpen(true);
    };

    const openEditModal = (bidang: BidangData) => {
        setEditingBidang(bidang);
        setSelectedParent(null);
        setIsModalOpen(true);
    };

    const deleteBidang = (id: number) => {
        if (confirm('Yakin hapus unit kerja ini? Jika memiliki sub-unit, harus dihapus dulu sub-unitnya.')) {
            router.delete(`/bidang/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Master Struktur', href: '/bidang' }]}>
            <Head title="Manajemen Struktur Organisasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 bg-muted/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Layers className="h-6 w-6 text-primary" />
                            Struktur Organisasi
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola Unit Utama, Kepala Badan, hingga Sub-Bagian terkecil di sini.
                        </p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari nama bagian..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8 bg-background"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreateRootModal} className="shrink-0 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Tambah Unit Utama</span>
                        </Button>
                    </div>
                </div>

                <BidangList
                    data={bidangs}
                    onEdit={openEditModal}
                    onDelete={deleteBidang}
                    onAddSub={openCreateSubModal}
                />

                <BidangFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingData={editingBidang}
                    parentData={selectedParent}
                />
            </div>
        </AppLayout>
    );
}
