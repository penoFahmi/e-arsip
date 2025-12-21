export interface BidangData {
    id: number;
    nama_bidang: string;
    kode: string | null;
    parent_id: number | null;
    users_count?: number;
    children?: BidangData[];
}
