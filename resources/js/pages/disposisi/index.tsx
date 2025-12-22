import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Search, FileSpreadsheet } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; 

import { DisposisiData } from './types';
import DisposisiList from './components/disposisi-list';
import DisposisiUpdateModal from './components/disposisi-update-modal';

interface Props extends PageProps {
    disposisis: { data: DisposisiData[]; links: any[] };
    filters: { search: string };
}

export default function DisposisiIndex({ disposisis, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedDisposisi, setSelectedDisposisi] = useState<DisposisiData | null>(null);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/disposisi', { search }, { preserveState: true });
        }
    };

    const openUpdateModal = (item: DisposisiData) => {
        setSelectedDisposisi(item);
        setIsUpdateModalOpen(true);
    };

    const handleExport = () => {
        window.location.href = '/disposisi/export';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Disposisi Masuk', href: '/disposisi' }]}>
            <Head title="Disposisi Masuk" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Disposisi Masuk</h2>
                        <p className="text-sm text-muted-foreground">Kelola tugas masuk dan buat agenda kegiatan langsung.</p>
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-2">
                         <Button
                            variant="outline"
                            className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={handleExport}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="hidden sm:inline">Rekap Excel</span>
                        </Button>

                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari No Surat / Perihal..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-8 bg-background"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <DisposisiList
                    data={disposisis.data}
                    onUpdateClick={openUpdateModal}
                />

                {/* Modal */}
                <DisposisiUpdateModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    disposisi={selectedDisposisi}
                />

            </div>
        </AppLayout>
    );
}
