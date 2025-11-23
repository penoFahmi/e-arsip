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
        'judul_agenda',
        'lokasi',
        'tgl_mulai',
        'tgl_selesai',
        'jam_mulai',
        'jam_selesai',
        'penanggung_jawab',
        'keterangan',
    ];

    protected $casts = [
        'tgl_mulai'   => 'date',
        'tgl_selesai' => 'date',
        'jam_mulai'   => 'datetime:H:i',
        'jam_selesai' => 'datetime:H:i',
    ];

    public function surat()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }

    public function penanggungJawab()
    {
        return $this->belongsTo(User::class, 'penanggung_jawab');
    }
}
