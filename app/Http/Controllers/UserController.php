<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Bidang;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
public function index(Request $request)
{
    $query = User::with('bidang')
        ->when($request->search, function ($q, $search) { /*...*/ })
        ->when($request->role, function ($q, $role) { /*...*/ })
        ->when($request->has('status'), function ($q) { /*...*/ });

    $users = $query->latest()->paginate(10)->withQueryString();

    $rawBidangs = Bidang::with('children')
        ->whereNull('parent_id')
        ->orderBy('id', 'asc')
        ->get();

    $bidangOptions = [];
    foreach ($rawBidangs as $root) {
        // Masukkan Induk
        $bidangOptions[] = [
            'id' => $root->id,
            'nama_bidang' => $root->nama_bidang,
            'is_group' => true
        ];

        // Masukkan Anak-anaknya (dengan tanda strip —)
        foreach ($root->children as $child) {
            $bidangOptions[] = [
                'id' => $child->id,
                'nama_bidang' => '— ' . $child->nama_bidang,
                'is_group' => false
            ];

            // Jika ada cucu (Level 3), loop lagi disini
            foreach($child->children as $cucu)
                $bidangOptions[] = [
                    'id' => $cucu->id,
                    'nama_bidang' => '—— ' . $cucu->nama_bidang,
                    'is_group' => false
                ];
        }
    }

    $roleLabels = AppSetting::where('key', 'like', 'label_%')->pluck('value', 'key');

    return Inertia::render('users/index', [
        'users' => $users,
        'bidangs' => $bidangOptions,
        'roleLabels' => $roleLabels,
        'filters' => $request->only(['search', 'role', 'status']),
    ]);
}

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:super_admin,level_1,level_2,level_3,staf'],
            'id_bidang' => ['nullable', 'exists:bidang,id'],
            'jabatan' => ['nullable', 'string'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'status_aktif' => ['boolean'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->back()->with('success', 'Pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:super_admin,level_1,level_2,level_3,staf'],
            'id_bidang' => ['nullable', 'exists:bidang,id'],
            'jabatan' => ['nullable', 'string'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'status_aktif' => ['boolean'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Data pegawai diperbarui.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pegawai berhasil dihapus.');
    }

    public function getBawahan()
    {
        $user = auth()->user();
        $query = User::query()->where('id', '!=', $user->id)->where('status_aktif', true);

        if ($user->role === 'level_1') {
            $query->where('role', 'level_2');
        } elseif ($user->role === 'level_2') {
            $query->where('role', 'level_3')
                ->where('id_bidang', $user->id_bidang);
        } elseif ($user->role === 'level_3') {
            $query->where('role', 'staf')
                ->where('id_bidang', $user->id_bidang);
        }

        $users = $query->select('id', 'name', 'jabatan', 'role')->get();

        return response()->json($users);
    }
}
