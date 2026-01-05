<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AgendaController extends Controller
{
    // === TAMPILAN LIST (TABEL) ===
    public function index(Request $request)
    {
        $user = auth()->user();

        // Load relasi user & bidang untuk ditampilkan di tabel
        $query = Agenda::with(['user', 'bidang'])
            ->orderBy('tgl_mulai', 'desc')
            ->orderBy('jam_mulai', 'asc');

        // [FILTER LOGIC]
        // 1. Admin Pusat / Kaban / Sekretariat -> LIHAT SEMUA
        $isGlobalAdmin = ($user->role === 'super_admin' || $user->role === 'level_1' || ($user->bidang && $user->bidang->kode === 'SEK'));

        if (!$isGlobalAdmin) {
            // 2. Staf Bidang -> Hanya lihat Bidangnya Sendiri + Agenda Global (Kantor)
            $query->where(function($q) use ($user) {
                $q->where('id_bidang', $user->id_bidang)
                  ->orWhereNull('id_bidang');
            });
        }

        if ($request->search) {
            $query->where('judul_agenda', 'like', "%{$request->search}%")
                ->orWhere('lokasi', 'like', "%{$request->search}%");
        }

        return Inertia::render('agenda/index', [
            'agendas' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'auth_user_id' => $user->id, // Kirim ID user login buat cek tombol edit di frontend
            'is_admin' => $isGlobalAdmin, // Kirim status admin
        ]);
    }

    // === DATA API UNTUK KALENDER ===
    public function calendarData(Request $request)
    {
        $user = auth()->user();

        // Ambil data rentang 1 tahun (biar ringan)
        $query = Agenda::with('bidang')
            ->where('tgl_mulai', '>=', now()->subYear())
            ->where('tgl_mulai', '<=', now()->addYear());

        // [FILTER LOGIC] Sama persis dengan index
        $isGlobalAdmin = ($user->role === 'super_admin' || $user->role === 'level_1' || ($user->bidang && $user->bidang->kode === 'SEK'));

        if (!$isGlobalAdmin) {
            $query->where(function($q) use ($user) {
                $q->where('id_bidang', $user->id_bidang)
                  ->orWhereNull('id_bidang');
            });
        }

        $events = $query->get()->map(function($agenda) {
            return [
                'id' => $agenda->id,
                'title' => $agenda->judul_agenda,
                // Pakai accessor 'start' & 'end' dari Model Agenda.php
                'start' => $agenda->start,
                'end' => $agenda->end,
                'allDay' => is_null($agenda->jam_mulai),
                'resource' => [
                    'lokasi' => $agenda->lokasi,
                    'bidang' => $agenda->bidang ? $agenda->bidang->nama_bidang : 'Global',
                    'warna'  => $agenda->warna_label ?? '#3b82f6'
                ]
            ];
        });

        return response()->json($events);
    }

    // === HALAMAN VIEW KALENDER ===
    public function calendarPage()
    {
        return Inertia::render('agenda/calendar');
    }

    // === SIMPAN DATA ===
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul_agenda' => 'required|string|max:255',
            'tgl_mulai' => 'required|date',
            'jam_mulai' => 'required',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'jam_selesai' => 'nullable',
            'lokasi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'warna_label' => 'required|string',
        ]);

        $user = auth()->user();

        // [LOGIC BIDANG]
        // Super Admin/Kaban -> Agenda Global (id_bidang = NULL)
        // Staf -> Agenda Bidang (id_bidang = User Bidang)
        $idBidang = $user->id_bidang;
        if ($user->role === 'super_admin' || $user->role === 'level_1') {
            $idBidang = null;
        }

        Agenda::create([
            'judul_agenda' => $validated['judul_agenda'],
            'tgl_mulai' => $validated['tgl_mulai'],
            'jam_mulai' => $validated['jam_mulai'],
            'tgl_selesai' => $validated['tgl_selesai'] ?? $validated['tgl_mulai'],
            'jam_selesai' => $validated['jam_selesai'],
            'lokasi' => $validated['lokasi'],
            'deskripsi' => $validated['deskripsi'],
            'warna_label' => $validated['warna_label'],
            'id_bidang' => $idBidang,
            'penanggung_jawab' => $user->id, // PENTING: Untuk cek hak akses edit nanti
            'id_surat' => null
        ]);

        return redirect()->back()->with('success', 'Agenda berhasil dijadwalkan.');
    }

    // === UPDATE DATA (DENGAN KEAMANAN) ===
    public function update(Request $request, Agenda $agenda)
    {
        $user = auth()->user();

        // [SECURITY CHECK]
        // Boleh edit jika: Super Admin ATAU Level 1 ATAU Pemilik Asli Agenda
        $isOwner = $agenda->penanggung_jawab == $user->id;
        $isAdmin = ($user->role === 'super_admin' || $user->role === 'level_1');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengedit agenda ini.');
        }

        $validated = $request->validate([
            'judul_agenda' => 'required|string|max:255',
            'tgl_mulai' => 'required|date',
            'jam_mulai' => 'required',
            'tgl_selesai' => 'nullable|date',
            'jam_selesai' => 'nullable',
            'lokasi' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'warna_label' => 'required|string',
        ]);

        $agenda->update($validated);

        return redirect()->back()->with('success', 'Agenda diperbarui.');
    }

    // === HAPUS DATA (DENGAN KEAMANAN) ===
    public function destroy(Agenda $agenda)
    {
        $user = auth()->user();

        // [SECURITY CHECK] Sama seperti Update
        $isOwner = $agenda->penanggung_jawab == $user->id;
        $isAdmin = ($user->role === 'super_admin' || $user->role === 'level_1');

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Anda tidak berhak menghapus agenda ini.');
        }

        $agenda->delete();
        return redirect()->back()->with('success', 'Agenda dihapus.');
    }
}
