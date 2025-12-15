export interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    jabatan?: string;
    no_hp?: string;
    id_bidang?: number;
    status_aktif: boolean;
    bidang?: { id: number; nama_bidang: string };
}

export interface BidangOption {
    id: number;
    nama_bidang: string;
}
