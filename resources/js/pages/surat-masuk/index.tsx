import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import komponen pecahan kita
import { SuratData, UserLite, BidangOption } from './types';
import SuratList from './components/surat-list';
import SuratFormModal from './components/surat-form-modal';
import DisposisiModal from './components/disposisi-modal';

interface Props extends PageProps {
    surats: { data: SuratData[]; links: any[] };
    users: UserLite[];
    bidangs: BidangOption[];
    filters: { search: string };
}

export default function SuratMasukIndex({ surats, users, bidangs, filters }: Props) {
    // --- STATE ---
    const [isSuratModalOpen, setisSuratModalOpen] = useState(false);
    const [editingSurat, setEditingSurat] = useState<SuratData | null>(null);
    const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState(false);
    const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<SuratData | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    // --- HANDLERS ---
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/surat-masuk', { search }, { preserveState: true });
        }
    };

    const openCreate = () => {
        setEditingSurat(null);
        setisSuratModalOpen(true);
    };

    const openEdit = (surat: SuratData) => {
        setEditingSurat(surat);
        setisSuratModalOpen(true);
    };

    const deleteSurat = (id: number) => {
        if (confirm('Hapus surat ini? File scan juga akan terhapus.')) {
            router.delete(`/surat-masuk/${id}`);
        }
    };

    const openDisposisi = (surat: SuratData) => {
        setSelectedSuratForDisposisi(surat);
        setIsDisposisiModalOpen(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Surat Masuk', href: '/surat-masuk' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Masuk" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* 1. Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Agenda Surat Masuk</h2>
                        <p className="text-sm text-muted-foreground">Kelola arsip surat masuk dinas.</p>
                    </div>

                    {/* Container Tombol & Search */}
                    <div className="flex w-full md:w-auto items-center gap-2">

                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari No / Perihal..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8 bg-background"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Tombol Export Agenda */}
                        <a
                            href="/laporan/agenda-surat-masuk"
                            target="_blank"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 shrink-0"
                            title="Export Laporan Agenda"
                        >
                            <FileSpreadsheet className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Export</span>
                        </a>

                        {/* Tombol Input Surat */}
                        <Button onClick={openCreate} className="shrink-0">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Input Surat</span>
                        </Button>
                    </div>
                </div>

                {/* 2. Content List */}
                <SuratList
                    data={surats.data}
                    onEdit={openEdit}
                    onDelete={deleteSurat}
                    onDisposisi={openDisposisi}
                />

                {/* 3. Modals */}
                <SuratFormModal
                    isOpen={isSuratModalOpen}
                    onClose={() => setisSuratModalOpen(false)}
                    editingData={editingSurat}
                />

                <DisposisiModal
                    isOpen={isDisposisiModalOpen}
                    onClose={() => setIsDisposisiModalOpen(false)}
                    surat={selectedSuratForDisposisi}
                />
            </div>
        </AppLayout>
    );
}
