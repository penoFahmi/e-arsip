<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bidang extends Model
{
    use HasFactory;

    protected $table = 'bidang';

    protected $fillable = [
        'nama_bidang',
        'kode',
        'parent_id', // [BARU]
        'urutan'     // [BARU]
    ];

    // Relasi ke User (Anggota Bidang)
    public function users()
    {
        return $this->hasMany(User::class, 'id_bidang');
    }

    // Relasi ke Induk (Misal: Sub-Bidang ke Bidang)
    public function parent()
    {
        return $this->belongsTo(Bidang::class, 'parent_id');
    }

    // Relasi ke Anak (Misal: Bidang ke Sub-Bidang)
    public function children()
    {
        return $this->hasMany(Bidang::class, 'parent_id');
    }
}
