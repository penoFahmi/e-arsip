<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    use HasFactory;

    protected $table = 'agenda';

    protected $fillable = [
        'id_surat',
        'id_bidang',
        'judul_agenda',
        'deskripsi',
        'lokasi',
        'tgl_mulai',
        'tgl_selesai',
        'jam_mulai',
        'jam_selesai',
        'warna_label',
        'penanggung_jawab',
    ];

    protected $casts = [
        'tgl_mulai'   => 'date',
        'tgl_selesai' => 'date',
    ];

    public function surat()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'id_bidang');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'penanggung_jawab');
    }
}
