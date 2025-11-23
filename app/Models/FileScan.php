<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileScan extends Model
{
        use HasFactory;

        protected $table = 'file_scan';

        protected $fillable = [
            'id_surat',
            'nama_file',
            'path_file',
            'tipe_file',
            'ukuran_file',
            'tgl_upload',
        ];

        protected $casts = [
            'tgl_upload' => 'datetime',
        ];

        public function surat()
        {
            return $this->belongsTo(SuratMasuk::class, 'id_surat');
        }
}
