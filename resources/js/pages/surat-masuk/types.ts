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

export interface SuratData {
    id: number;
    no_agenda: string;
    kode_klasifikasi?: string;
    id_bidang_penerima?: number | null;

    no_surat: string;
    tgl_surat: string;
    tgl_terima: string;
    pengirim: string;
    perihal: string;
    ringkasan?: string;
    sifat_surat: 'biasa' | 'penting' | 'rahasia';
    media: 'fisik' | 'digital';
    file_scan?: FileScan[];
}
