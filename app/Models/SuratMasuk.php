<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratMasuk extends Model
{
    use HasFactory;

    protected $table = 'surat_masuk';

    protected $fillable = [
        'no_agenda',
        'no_surat',
        'tgl_surat',
        'tgl_terima',
        'pengirim',
        'perihal',
        'ringkasan',
        'sifat_surat',
        'media',
        'id_user_input',
        'status_surat',
    ];

    protected $casts = [
        'tgl_surat'  => 'date',
        'tgl_terima' => 'date',
    ];

    public function userInput()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }

    public function fileScan()
    {
        return $this->hasMany(FileScan::class, 'id_surat');
    }

    public function disposisi()
    {
        return $this->hasMany(Disposisi::class, 'id_surat');
    }

    public function logTrackings()
    {
        return $this->hasMany(LogTracking::class, 'id_surat');
    }

    public function agenda()
    {
        return $this->hasMany(Agenda::class, 'id_surat');
    }
}
