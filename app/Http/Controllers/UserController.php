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
            ->when($request->search, function ($q, $search) { /* ... */ })
            ->when($request->role, function ($q, $role) { /* ... */ })
            ->when($request->has('status'), function ($q) { /* ... */ });

        $users = $query->latest()->paginate(10)->withQueryString();

        $allBidangs = Bidang::orderBy('id', 'asc')->get();

        $rootBidangs = $allBidangs->whereNull('parent_id');

        $bidangOptions = $this->flattenBidangs($rootBidangs, $allBidangs);

        $roleLabels = AppSetting::where('key', 'like', 'label_%')->pluck('value', 'key');

        return Inertia::render('users/index', [
            'users' => $users,
            'bidangs' => $bidangOptions,
            'roleLabels' => $roleLabels,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    private function flattenBidangs($nodes, $allNodes, $depth = 0)
    {
        $result = [];

        foreach ($nodes as $node) {
            // Tentukan prefix strip berdasarkan kedalaman (0 = tanpa strip)
            $prefix = $depth > 0 ? str_repeat('— ', $depth) . ' ' : '';

            $result[] = [
                'id' => $node->id,
                'nama_bidang' => $prefix . $node->nama_bidang,
                // Induk (Level 0) dianggap group, sisanya bukan
                'is_group' => $depth === 0
            ];

            // Cari anak-anak dari node ini di koleksi utama ($allNodes)
            $children = $allNodes->where('parent_id', $node->id);

            // Jika punya anak, panggil fungsi ini lagi (Rekursif) dengan depth + 1
            if ($children->count() > 0) {
                $result = array_merge($result, $this->flattenBidangs($children, $allNodes, $depth + 1));
            }
        }

        return $result;
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:super_admin,level_1,level_2,admin_bidang,level_3,staf'],
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
            'role' => ['required', 'in:super_admin,level_1,level_2,admin_bidang,level_3,staf'],
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
        $query = User::query()
            ->where('id', '!=', $user->id)
            ->where('status_aktif', true);

        // 1. Kaban (Level 1) -> Hanya melihat Kabid (Level 2) & Admin Bidang
        if ($user->role === 'level_1') {
            $query->whereIn('role', ['level_2', 'admin_bidang']);
        }

        // 2. Kabid (Level 2) -> Melihat Kasubbid (Level 3) & Staf DI BIDANGNYA
        elseif ($user->role === 'level_2') {
            // Ambil ID Bidang Saya & Anak-anak Bidang Saya
            // (Asumsi: Kabid membawahi bidang induk, staf ada di sub-bidang)
            $query->where(function ($q) use ($user) {
                // User yang satu bidang persis
                $q->where('id_bidang', $user->id_bidang)
                    // Atau user yang ada di sub-bidang (anak)
                    ->orWhereHas('bidang', function ($b) use ($user) {
                        $b->where('parent_id', $user->id_bidang);
                    });
            })
                // Filter Role yang masuk akal (Kasubbid, Staf, Admin)
                ->whereIn('role', ['level_3', 'staf', 'admin_bidang']);
        }

        // 3. Kasubbid (Level 3) -> Hanya melihat Staf DI SUB-BIDANGNYA
        elseif ($user->role === 'level_3') {
            $query->where('id_bidang', $user->id_bidang)
                ->where('role', 'staf');
        }

        // 4. Admin Bidang -> Bisa melihat semua orang di bidang itu (Untuk distribusi fisik)
        elseif ($user->role === 'admin_bidang') {
            $query->where(function ($q) use ($user) {
                $q->where('id_bidang', $user->id_bidang)
                    ->orWhereHas('bidang', function ($b) use ($user) {
                        $b->where('parent_id', $user->id_bidang);
                    });
            });
        }

        // Urutkan berdasarkan jabatan biar rapi
        $users = $query->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->select('id', 'name', 'jabatan', 'role')
            ->get();

        return response()->json($users);
    }
}
