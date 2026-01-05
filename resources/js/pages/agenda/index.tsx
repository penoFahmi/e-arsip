import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Plus, Search, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AgendaModal from './components/agenda-modal';

interface Agenda {
    id: number;
    judul_kegiatan: string;
    deskripsi: string;
    tgl_mulai: string;
    tgl_selesai: string;
    lokasi: string;
    peserta: string;
    warna_label: string;
    bidang?: { nama_bidang: string };
}

interface Props extends PageProps {
    agendas: { data: Agenda[]; links: any[] };
    filters: { search: string };
    auth_user_id: number;
    is_admin: boolean;
}

export default function AgendaIndex({ agendas, filters, auth_user_id, is_admin }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<Agenda | null>(null);

    const canEdit = is_admin || (item.penanggung_jawab === auth_user_id);
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') router.get('/agenda', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus jadwal kegiatan ini?')) router.delete(`/agenda/${id}`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Jadwal Kegiatan', href: '/agenda' }]}>
            <Head title="Jadwal Kegiatan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-orange-500" />
                            Agenda Kegiatan
                        </h2>
                        <p className="text-sm text-muted-foreground">Kelola jadwal rapat dan kegiatan dinas.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative w-64 hidden md:block">
                            <Input
                                placeholder="Cari kegiatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" /> Jadwal Baru
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {agendas.data.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg bg-gray-50">
                            Belum ada agenda kegiatan.
                        </div>
                    ) : (
                        agendas.data.map((item) => (
                            <Card key={item.id} className="border-l-4 shadow-sm hover:shadow-md transition-all" style={{ borderLeftColor: item.warna_label }}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-gray-50 text-[10px]">
                                            {item.bidang ? item.bidang.nama_bidang : 'Global / Kantor'}
                                        </Badge>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditingData(item); setIsModalOpen(true); }} className="...">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="...">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg leading-tight mb-1">{item.judul_kegiatan}</h3>

                                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                {new Date(item.tgl_mulai).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {item.lokasi && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>{item.lokasi}</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.deskripsi && <p className="text-xs text-gray-500 line-clamp-2 italic">"{item.deskripsi}"</p>}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <AgendaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    editingData={editingData}
                />
            </div>
        </AppLayout>
    );
}
