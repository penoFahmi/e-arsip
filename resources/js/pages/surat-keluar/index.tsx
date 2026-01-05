import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Plus, Search, Send } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SuratKeluarData, UserLite, BidangOption } from './types';
import SuratKeluarList from './components/surat-keluar-list';
import SuratKeluarFormModal from './components/surat-keluar-form-modal';
import SuratKeluarUploadModal from './components/surat-keluar-upload-modal';

interface Props extends PageProps {
    surats: { data: SuratKeluarData[]; links: any[] };
    users: UserLite[];
    bidangs: { id: number; nama_bidang: string }[];
    filters: { search: string; bidang: string };
    canFilterBidang: boolean;
}

export default function SuratKeluarIndex({ surats, filters, bidangs, canFilterBidang }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBidang, setSelectedBidang] = useState(filters.bidang || '');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingData, setEditingData] = useState<SuratKeluarData | null>(null);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadData, setUploadData] = useState<SuratKeluarData | null>(null);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/surat-keluar', { search }, { preserveState: true });
        }
    };
    const handleFilter = (key: string, value: string) => {
        router.get('/surat-keluar',
            {
                search: key === 'search' ? value : search,
                bidang: key === 'bidang' ? value : selectedBidang
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openCreate = () => {
        setEditingData(null);
        setIsFormOpen(true);
    };

    const openEdit = (surat: SuratKeluarData) => {
        setEditingData(surat);
        setIsFormOpen(true);
    };

    const openUploadBukti = (surat: SuratKeluarData) => {
        setUploadData(surat);
        setIsUploadOpen(true);
    };

    const deleteSurat = (id: number) => {
        if (confirm('Yakin ingin menghapus surat ini?')) {
            router.delete(`/surat-keluar/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Surat Keluar', href: '/surat-keluar' }]}>
            <Head title="Surat Keluar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Send className="h-6 w-6 text-orange-500" />
                            Surat Keluar & Ekspedisi
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola nomor surat keluar dan upload bukti tanda terima pengiriman.
                        </p>
                    </div>

                    {canFilterBidang && (
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm max-w-[150px]"
                            value={selectedBidang}
                            onChange={(e) => {
                                setSelectedBidang(e.target.value);
                                handleFilter('bidang', e.target.value);
                            }}
                        >
                            <option value="">Semua Bidang</option>
                            {bidangs.map(b => (
                                <option key={b.id} value={b.id}>{b.nama_bidang}</option>
                            ))}
                        </select>
                    )}

                    <div className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari Tujuan / Perihal..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-9 bg-background shadow-sm"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={openCreate} className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                            <Plus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Buat Surat</span>
                            <span className="md:hidden">Baru</span>
                        </Button>
                    </div>
                </div>

                <SuratKeluarList
                    data={surats.data}
                    onEdit={openEdit}
                    onDelete={deleteSurat}
                    onUploadBukti={openUploadBukti}
                />

                <SuratKeluarFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    editingData={editingData}
                />

                <SuratKeluarUploadModal
                    isOpen={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    surat={uploadData}
                />

            </div>
        </AppLayout>
    );
}
