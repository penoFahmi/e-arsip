import { useState, FormEventHandler } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Plus, Search, Pencil, Trash2, Building2, Users } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

// Tipe Data
interface BidangData {
    id: number;
    nama_bidang: string;
    kode: string;
    users_count?: number; // Dari withCount di controller
}

interface Props extends PageProps {
    bidangs: { data: BidangData[]; links: any[] };
    filters: { search: string };
}

export default function BidangIndex({ bidangs, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBidang, setEditingBidang] = useState<BidangData | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_bidang: '',
        kode: '',
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/bidang', { search }, { preserveState: true });
        }
    };

    const openCreateModal = () => {
        setEditingBidang(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (bidang: BidangData) => {
        setEditingBidang(bidang);
        setData({
            nama_bidang: bidang.nama_bidang,
            kode: bidang.kode,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => setIsModalOpen(false) };

        if (editingBidang) {
            put(`/bidang/${editingBidang.id}`, options);
        } else {
            post('/bidang', options);
        }
    };

    const deleteBidang = (id: number) => {
        if (confirm('Yakin hapus bidang ini?')) {
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

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Master Bidang</h2>
                        <p className="text-sm text-muted-foreground">Kelola unit kerja / divisi instansi.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Cari bidang..."
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

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 overflow-hidden bg-background">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Kode</th>
                                <th className="px-6 py-3 font-medium">Nama Bidang</th>
                                <th className="px-6 py-3 font-medium text-center">Jumlah Pegawai</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bidangs.data.map((bidang) => (
                                <tr key={bidang.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-mono text-xs">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {bidang.kode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        {bidang.nama_bidang}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                            <Users className="h-3 w-3" /> {bidang.users_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(bidang)}>
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteBidang(bidang.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bidangs.data.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">Belum ada data bidang.</div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingBidang ? 'Edit Bidang' : 'Tambah Bidang Baru'}</DialogTitle>
                        <DialogDescription>
                            Pastikan Kode Bidang unik (singkatan).
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nama_bidang">Nama Bidang / Unit</Label>
                            <Input
                                id="nama_bidang"
                                value={data.nama_bidang}
                                onChange={e => setData('nama_bidang', e.target.value)}
                                placeholder="Contoh: Bidang Perbendaharaan"
                                required
                            />
                            <InputError message={errors.nama_bidang} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kode">Kode Singkatan</Label>
                            <Input
                                id="kode"
                                value={data.kode}
                                onChange={e => setData('kode', e.target.value)}
                                placeholder="Contoh: BEN, ANG, SEK"
                                required
                            />
                            <InputError message={errors.kode} />
                        </div>

                        <DialogFooter>
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
