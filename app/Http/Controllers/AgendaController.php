<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Agenda::with(['surat', 'penanggungJawab'])
            ->orderBy('tgl_mulai', 'desc')
            ->orderBy('jam_mulai', 'asc');

        if ($request->search) {
            $query->where('judul_agenda', 'like', "%{$request->search}%")
                ->orWhere('lokasi', 'like', "%{$request->search}%");
        }

        return Inertia::render('agenda/index', [
            'agendas' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_surat' => 'nullable|exists:surat_masuk,id',
            'judul_agenda' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'jam_mulai' => 'required',
            'jam_selesai' => 'nullable|after:jam_mulai',
            'keterangan' => 'nullable|string',
            'penanggung_jawab' => 'nullable|exists:users,id',
        ]);

        if (empty($validated['penanggung_jawab'])) {
            $validated['penanggung_jawab'] = auth()->id();
        }

        \App\Models\Agenda::create($validated);

        return redirect()->back()->with('success', 'Jadwal kegiatan berhasil disimpan.');
    }
}
