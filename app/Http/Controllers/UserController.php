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
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            })
            // [TAMBAHAN] Filter Role
            ->when($request->role, function ($q, $role) {
                $q->where('role', $role);
            })
            // [TAMBAHAN] Filter Status
            ->when($request->has('status'), function ($q) use ($request) {
                if ($request->status !== null) {
                    $q->where('status_aktif', $request->status);
                }
            });

        $users = $query->latest()->paginate(10)->withQueryString();

        // Ambil data Bidang untuk dropdown form
        $bidangs = Bidang::select('id', 'nama_bidang')->get();

        // [BARU] Ambil Label Role dari Settings agar Admin tahu Level 1 itu siapa
        // Hasilnya: ['label_level_1' => 'Kepala Dinas', 'label_level_2' => 'Kabid', ...]
        $roleLabels = AppSetting::where('key', 'like', 'label_%')->pluck('value', 'key');

        return Inertia::render('users/index', [
            'users' => $users,
            'bidangs' => $bidangs,
            'roleLabels' => $roleLabels,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        // Karena pakai Fortify/CreateNewUser agak ribet customisasinya,
        // kita manual store disini saja biar kontrol penuh role barunya.

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users'],
            'email' => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // butuh field password_confirmation
            // [BARU] Validasi Role Generic
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
            // [BARU] Update Validasi Role
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

    // API untuk mengambil daftar bawahan (Dipanggil oleh React saat buka Modal Disposisi)
    public function getBawahan()
    {
        $user = auth()->user();
        $query = User::query()->where('id', '!=', $user->id)->where('status_aktif', true);

        // LOGIKA HIERARKI OTOMATIS
        if ($user->role === 'level_1') {
            // Level 1 (Kaban) hanya bisa perintah ke Level 2 (Sekretaris/Kabid)
            $query->where('role', 'level_2');
        } elseif ($user->role === 'level_2') {
            // Level 2 (Kabid) hanya bisa perintah ke Level 3 (Kasubbid) DI BIDANGNYA SENDIRI
            // Atau ke Sekretariat (Cross-disposisi jarang, tapi bisa dibuka jika perlu)
            $query->where('role', 'level_3')
                ->where('id_bidang', $user->id_bidang);
            // Jika Kabid Anggaran, cuma muncul Kasubbid di Anggaran
        } elseif ($user->role === 'level_3') {
            // Level 3 (Kasubbid) perintah ke Staf di bidangnya
            $query->where('role', 'staf')
                ->where('id_bidang', $user->id_bidang);
        }

        // Select data seperlunya
        $users = $query->select('id', 'name', 'jabatan', 'role')->get();

        return response()->json($users);
    }
}
