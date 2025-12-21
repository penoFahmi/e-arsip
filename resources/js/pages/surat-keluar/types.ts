export interface UserLite {
    id: number;
    name: string;
    jabatan: string;
    id_bidang: number;
}

export interface FileScan {
    id: number;
    nama_file: string;
    path_file: string;
}

export interface BidangOption {
    id: number;
    nama_bidang: string;
}

export interface SuratKeluarData {
    id: number;
    no_agenda: string;
    no_surat?: string;
    tgl_surat: string;
    tujuan: string;
    perihal: string;
    sifat_surat: 'biasa' | 'penting' | 'rahasia';
    status_surat: 'draft' | 'kirim' | 'diterima';
    file_surat?: string;
    file_bukti?: string;
    user?: UserLite;
}
