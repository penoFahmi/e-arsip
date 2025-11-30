<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SetupController extends Controller
{
    // Menampilkan Form React (ForceChangeEmail.tsx)
    public function show()
    {
        return Inertia::render('auth/force-change-email');
    }

    // Memproses Ganti Email
    public function update(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'current_password'], // Wajib masukkan password lama demi keamanan
        ]);

        $user = $request->user();

        // Update Email di Database
        $user->forceFill([
            'email' => $request->email,
            'email_verified_at' => null, // Reset verifikasi karena email baru
        ])->save();

        // Kirim Email Verifikasi ke alamat BARU
        $user->sendEmailVerificationNotification();

        // Redirect ke dashboard
        // (Nanti akan otomatis dihadang lagi oleh Fortify suruh verifikasi email, sesuai rencana)
        return redirect()->route('dashboard');
    }
}
