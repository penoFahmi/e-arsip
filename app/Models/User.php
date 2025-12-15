<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'jabatan',
        'id_bidang',
        'no_hp',
        'role',
        'status_aktif',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'status_aktif' => 'boolean',
        ];
    }

    public function suratMasukDiinput()
    {
        return $this->hasMany(SuratMasuk::class, 'id_user_input');
    }

    public function disposisiDari()
    {
        return $this->hasMany(Disposisi::class, 'dari_user_id');
    }

    public function disposisiKe()
    {
        return $this->hasMany(Disposisi::class, 'ke_user_id');
    }

    public function logTrackings()
    {
        return $this->hasMany(LogTracking::class, 'id_user');
    }

    public function agendaTanggungJawab()
    {
        return $this->hasMany(Agenda::class, 'penanggung_jawab');
    }

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'id_bidang');
    }
    // Helper untuk cek level
    public function isSuperAdmin() { return $this->role === 'super_admin'; }
    public function isLevel1() { return $this->role === 'level_1'; }
    public function isLevel2() { return $this->role === 'level_2'; }
}
