<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bidang;
use App\Actions\Fortify\CreateNewUser;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with('bidang')
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });

        $users = $query->latest()->paginate(10)->withQueryString();
        $bidangs = Bidang::all();

        return Inertia::render('users/index', [
            'users' => $users,
            'bidangs' => $bidangs,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, CreateNewUser $creator)
    {
        $creator->create($request->all());
        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],

            // Password bersifat opsional (nullable).
            // Kalau diisi, berarti Admin mereset password user tersebut.
            'password' => ['nullable', 'string', 'min:8'],

            'role' => ['required', 'in:super_admin,admin_bidang,pimpinan,staf'],
            'id_bidang' => ['nullable', 'exists:bidang,id'],
            'jabatan' => ['nullable', 'string'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'status_aktif' => ['boolean'],
        ]);

        // 2. Cek apakah Admin mengganti Password?
        if (!empty($validated['password'])) {
            // Hash password baru dan simpan
            $validated['password'] = Hash::make($validated['password']);
        } else {
            // Jika kosong, hapus dari array agar password lama tidak tertimpa null/kosong
            unset($validated['password']);
        }

        // 3. Update Data ke Database
        $user->update($validated);

        return redirect()->back()->with('success', 'Data user berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}
