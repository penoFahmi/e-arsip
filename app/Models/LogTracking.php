<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogTracking extends Model
{

    use HasFactory;

    protected $table = 'log_tracking';

    protected $fillable = [
        'id_surat',
        'id_user',
        'aksi',
        'waktu_aksi',
        'keterangan',
    ];

    protected $casts = [
        'waktu_aksi' => 'datetime',
    ];

    public function surat()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
