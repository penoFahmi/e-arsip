import { useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
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
import { UserData, BidangOption } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingData: UserData | null;
    bidangs: BidangOption[];
    roleLabels: Record<string, string>;
}

export default function UserFormModal({ isOpen, onClose, editingData, bidangs, roleLabels }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staf',
        id_bidang: '',
        status_aktif: true,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingData) {
                setData({
                    name: editingData.name,
                    username: editingData.username,
                    email: editingData.email,
                    password: '',
                    password_confirmation: '',
                    role: editingData.role,
                    id_bidang: editingData.id_bidang ? String(editingData.id_bidang) : '',
                    status_aktif: Boolean(editingData.status_aktif),
                });
            } else {
                reset();
            }
        }
    }, [isOpen, editingData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose };

        if (editingData) {
            put(`/users/${editingData.id}`, options);
        } else {
            post('/users', options);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingData ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
                    <DialogDescription>
                        Isi informasi pegawai di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={data.username} onChange={e => setData('username', e.target.value)} required />
                            <InputError message={errors.username} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password {editingData && '(Opsional)'}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder={editingData ? "Kosongkan jika tetap" : "Min. 8 karakter"}
                                required={!editingData}
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Pass</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi Password"
                                required={!editingData}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role / Level Akses</Label>
                            <select
                                id="role"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                            >
                                <option value="staf">Staf (Pelaksana)</option>
                                {/* [BARU] Pilihan Role Dinamis sesuai Settings */}
                                <option value="level_3">
                                    {roleLabels['label_level_3'] || 'Level 3 (Kasubbag/Kasi)'}
                                </option>
                                <option value="level_2">
                                    {roleLabels['label_level_2'] || 'Level 2 (Kabid/Sekretaris)'}
                                </option>
                                <option value="level_1">
                                    {roleLabels['label_level_1'] || 'Level 1 (Kepala Dinas)'}
                                </option>
                                <option value="super_admin">Super Admin (IT)</option>
                            </select>
                            <InputError message={errors.role} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="id_bidang">Unit Kerja</Label>
                            <select
                                id="id_bidang"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:opacity-50"
                                value={data.id_bidang}
                                onChange={e => setData('id_bidang', e.target.value)}
                            >
                                <option value="">-- Pilih Unit --</option>
                                {bidangs.map(b => (
                                    <option key={b.id} value={b.id}>{b.nama_bidang}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground">Kosongkan jika Pimpinan Tertinggi.</p>
                            <InputError message={errors.id_bidang} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="status_aktif"
                            checked={data.status_aktif}
                            onChange={e => setData('status_aktif', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <Label htmlFor="status_aktif">Akun Aktif</Label>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
