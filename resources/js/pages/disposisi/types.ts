export interface SuratData {
    id: number;
    no_surat: string;
    perihal: string;
    pengirim: string;
    file_scan?: { path_file: string }[];
    agenda?: AgendaData[];
}

export interface AgendaData {
    id: number;
    judul_agenda: string;
    lokasi: string;
    tgl_mulai: string;
    jam_mulai: string;
    tgl_selesai: string;
    jam_selesai: string;
}

export interface UserData {
    name: string;
    jabatan?: string;
}

export interface DisposisiData {
    id: number;
    tgl_disposisi: string;
    instruksi: string;
    batas_waktu?: string;

    sifat_disposisi: 'biasa' | 'segera' | 'sangat_segera' | 'rahasia';
    parent?: {
        dari_user: UserData
    };

    status_disposisi: 'terkirim' | 'dibaca' | 'tindak_lanjut' | 'selesai';
    catatan?: string;
    surat: SuratData;
    dari_user: UserData;
    file_tindak_lanjut?: string;
}
