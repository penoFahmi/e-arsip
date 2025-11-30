<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bidang extends Model
{
    use HasFactory;

    // Nama tabel di database (opsional jika sesuai standar plural, tapi aman ditulis)
    protected $table = 'bidang';

    protected $fillable = [
        'nama_bidang',
        'kode',
    ];

    // Relasi balik: Satu Bidang punya banyak User
    public function users()
    {
        return $this->hasMany(User::class, 'id_bidang');
    }
}
