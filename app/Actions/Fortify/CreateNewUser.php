<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // 1. VALIDASI DATA LENGKAP
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users'], // Wajib Unik
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),

            // Validasi Role & Bidang
            'role' => ['required', 'in:super_admin,admin_bidang,pimpinan,staf'],
            'id_bidang' => ['nullable', 'exists:bidang,id'], // Cek tabel bidang

            // Data Tambahan
            'jabatan' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['nullable', 'string', 'max:20'],
        ])->validate();

        // 2. SIMPAN KE DATABASE
        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']), // Hash Password di sini
            'role' => $input['role'],
            'id_bidang' => $input['id_bidang'] ?? null, // Pakai null coalescing operator
            'jabatan' => $input['jabatan'] ?? null,
            'no_hp' => $input['no_hp'] ?? null,
            'status_aktif' => true, // Default user baru selalu aktif
        ]);
    }
}
