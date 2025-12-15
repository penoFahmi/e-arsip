<!DOCTYPE html>
<html>
<head>
    <title>Laporan Agenda Surat Masuk</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; }
        h2 { text-align: center; margin-bottom: 5px; }
        p { text-align: center; margin-top: 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; text-align: center; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <h2>AGENDA SURAT MASUK TAHUN 2025</h2>
    <p>Periode: {{ $periode }}</p>

    <table>
        <thead>
            <tr>
                <th width="5%">No. Agenda</th>
                <th width="12%">Tanggal Terima</th>
                <th width="20%">Asal Surat</th>
                <th width="20%">Nomor / Tanggal Surat</th>
                <th width="28%">Perihal</th>
                <th width="15%">Disposisi Terakhir</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $surat)
            <tr>
                <td class="text-center">{{ $surat->no_agenda ?? '-' }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($surat->tgl_terima)->format('d-m-Y') }}</td>
                <td>{{ $surat->pengirim }}</td>
                <td>
                    {{ $surat->no_surat }}<br>
                    <small class="text-muted">({{ \Carbon\Carbon::parse($surat->tgl_surat)->format('d-m-Y') }})</small>
                </td>
                <td>{{ $surat->perihal }}</td>
                <td>
                    {{-- Mengambil user penerima disposisi terakhir --}}
                    @if($surat->status_surat == 'didisposisi' && $surat->disposisi->last())
                        {{ $surat->disposisi->last()->keUser->jabatan ?? $surat->disposisi->last()->keUser->name }}
                    @else
                        -
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center">Tidak ada data surat pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
