import { useEffect, FormEventHandler, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Briefcase, KeyRound } from 'lucide-react';
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
        jabatan: '',
        no_hp: '',  
        status_aktif: true,
    });

    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            setChangePassword(false);
            if (editingData) {
                setData({
                    name: editingData.name,
                    username: editingData.username,
                    email: editingData.email,
                    password: '',
                    password_confirmation: '',
                    role: editingData.role,
                    id_bidang: editingData.id_bidang ? String(editingData.id_bidang) : '',
                    jabatan: editingData.jabatan || '',
                    no_hp: editingData.no_hp || '',
                    status_aktif: Boolean(editingData.status_aktif),
                });
            } else {
                reset();
                setChangePassword(true);
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

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'super_admin': return 'Akses penuh ke seluruh sistem & pengaturan.';
            case 'level_1': return 'Pimpinan Tertinggi (Kepala Badan). Disposisi ke Level 2.';
            case 'level_2': return 'Sekretaris/Kabid. Menerima disposisi Kaban & meneruskan ke Kasi.';
            case 'level_3': return 'Kasubbag/Kasi. Pelaksana teknis & memimpin staf.';
            case 'staf': return 'User biasa. Hanya bisa melihat surat masuk & disposisi ke dirinya.';
            default: return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl overflow-hidden p-0">
                <div className="bg-muted/40 px-6 py-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingData ? <User className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                            {editingData ? `Edit Pegawai: ${editingData.name}` : 'Tambah Pegawai Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Lengkapi data akun dan profil kepegawaian di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 mb-3">
                                <KeyRound className="h-4 w-4" />
                                Data Akun Login
                            </div>

                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={e => setData('username', e.target.value)}
                                        placeholder="nip_atau_nama"
                                        className="bg-muted/20"
                                        required
                                    />
                                    <InputError message={errors.username} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="email@kantor.go.id"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="role">Role / Level Akses</Label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                    >
                                        <option value="super_admin">Super Admin (IT)</option>
                                        <option value="level_1">{roleLabels['label_level_1'] || 'Level 1'}</option>
                                        <option value="level_2">{roleLabels['label_level_2'] || 'Level 2'}</option>
                                        <option value="level_3">{roleLabels['label_level_3'] || 'Level 3'}</option>
                                        <option value="staf">Staf (Pelaksana)</option>
                                    </select>
                                    <p className="text-[11px] text-muted-foreground mt-1 italic">
                                        {getRoleDescription(data.role)}
                                    </p>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="pt-2">
                                    {editingData && !changePassword ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-muted-foreground dashed border-dashed"
                                            onClick={() => setChangePassword(true)}
                                        >
                                            <KeyRound className="mr-2 h-3 w-3" /> Ganti Password?
                                        </Button>
                                    ) : (
                                        <div className="space-y-3 p-3 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 rounded-lg">
                                            <div className="space-y-1">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    placeholder={editingData ? "Password Baru" : "Minimal 8 karakter"}
                                                    required={!editingData}
                                                />
                                                <InputError message={errors.password} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="password_confirmation">Ulangi Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={e => setData('password_confirmation', e.target.value)}
                                                    placeholder="Konfirmasi"
                                                />
                                            </div>
                                            {editingData && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs w-full text-muted-foreground"
                                                    onClick={() => {
                                                        setChangePassword(false);
                                                        setData('password', '');
                                                        setData('password_confirmation', '');
                                                    }}
                                                >
                                                    Batal Ganti
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 mb-3">
                                <Briefcase className="h-4 w-4" />
                                Profil Pegawai
                            </div>

                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Nama Lengkap & Gelar</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso, S.Kom"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="no_hp">No. Handphone / WA</Label>
                                    <Input
                                        id="no_hp"
                                        value={data.no_hp}
                                        onChange={e => setData('no_hp', e.target.value)}
                                        placeholder="0812..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="id_bidang">Unit Kerja / Penempatan</Label>
                                    <select
                                        id="id_bidang"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={data.id_bidang}
                                        onChange={e => setData('id_bidang', e.target.value)}
                                    >
                                        <option value="">-- Pilih Unit Kerja --</option>
                                        {bidangs.map(b => (
                                            <option
                                                key={b.id}
                                                value={b.id}
                                                className={b.is_group ? "font-bold text-black" : "text-gray-600 pl-4"}
                                            >
                                                {b.nama_bidang}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Pilih <strong>Unit Utama</strong> (mis: Kepala Badan) jika User adalah Kepala Badan.
                                    </p>
                                    <InputError message={errors.id_bidang} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="jabatan">Nama Jabatan (di SK)</Label>
                                    <Input
                                        id="jabatan"
                                        value={data.jabatan}
                                        onChange={e => setData('jabatan', e.target.value)}
                                        placeholder="Contoh: Plt. Kepala Badan / Staf Administrasi"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Jabatan yang akan muncul di surat/laporan.
                                    </p>
                                </div>

                                <div className="pt-4 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="status_aktif"
                                        checked={data.status_aktif}
                                        onChange={e => setData('status_aktif', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <Label htmlFor="status_aktif" className="cursor-pointer font-medium">Akun Aktif</Label>
                                </div>
                                <p className="text-[10px] text-muted-foreground pl-6 -mt-2">
                                    Jika tidak dicentang, user tidak bisa login.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-8 border-t pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            {processing ? 'Menyimpan...' : (editingData ? 'Simpan Perubahan' : 'Tambah Pegawai')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
