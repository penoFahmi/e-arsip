import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Search } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';

// Import komponen pecahan
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Disposisi Masuk', href: '/disposisi' }]}>
            <Head title="Disposisi Masuk" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Disposisi Masuk</h2>
                        <p className="text-sm text-muted-foreground">Daftar tugas dan disposisi yang perlu Anda tindak lanjuti.</p>
                    </div>
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

                {/* List Content */}
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
