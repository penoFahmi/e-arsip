<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratKeluar extends Model
{
    use HasFactory;

    protected $table = 'surat_keluar';

    protected $fillable = [
        'no_agenda',
        'no_surat',
        'kode_klasifikasi',
        'tgl_surat',
        'tujuan',
        'perihal',
        'ringkasan',
        'sifat_surat',
        'status_surat',
        'file_surat',
        'file_bukti',
        'id_user_input',
        'id_bidang',
    ];

    protected $casts = [
        'tgl_surat' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'id_bidang');
    }
}
