<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disposisi extends Model
{
    use HasFactory;

    protected $table = 'disposisi';

    protected $fillable = [
        'id_surat',
        'dari_user_id',
        'ke_user_id',
        'tgl_disposisi',
        'instruksi',
        'batas_waktu',
        'status_disposisi',
        'catatan',
    ];

    protected $casts = [
        'tgl_disposisi' => 'date',
        'batas_waktu'   => 'date',
    ];

    public function surat()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }

    public function dariUser()
    {
        return $this->belongsTo(User::class, 'dari_user_id');
    }

    public function keUser()
    {
        return $this->belongsTo(User::class, 'ke_user_id');
    }
}
