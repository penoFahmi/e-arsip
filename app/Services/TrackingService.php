<?php

namespace App\Services;

use App\Models\LogTracking;

class TrackingService
{
    /**
     * Catat log baru
     */
    public static function record($suratId, $aksi, $keterangan = null)
    {
        LogTracking::create([
            'id_surat' => $suratId,
            'id_user'  => auth()->id(), // Siapa yang melakukan aksi ini? User yg login
            'aksi'     => $aksi,
            'waktu_aksi' => now(),
            'keterangan' => $keterangan,
        ]);
    }
}
