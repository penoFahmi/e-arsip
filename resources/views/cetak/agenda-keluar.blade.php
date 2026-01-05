<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Agenda Surat Keluar</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        h3 { text-align: center; margin: 0; text-transform: uppercase; font-weight: bold; }
        p { text-align: center; margin: 5px 0; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid black; padding: 5px; vertical-align: top; }
        th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
    </style>
</head>
<body onload="window.print()">

    <h3>AGENDA SURAT KELUAR TAHUN {{ date('Y') }}</h3>
    <p>{{ $bidang_nama }} | Periode: {{ $periode }}</p>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="20%">Nomor / Tanggal Surat</th>
                <th width="15%">Asal Surat</th>
                <th width="35%">Perihal Surat</th>
                <th width="25%">Disposisi</th>
                {{-- Di Word Surat Keluar, kolom 'Disposisi' berisi TUJUAN surat (misal: U/ Kepala BAPPEDA) --}}
            </tr>
        </thead>
        <tbody>
            @forelse($surats as $index => $surat)
            <tr>
                <td class="text-center">{{ $index + 1 }}.</td>
                <td>
                    {{ $surat->no_surat ?? $surat->no_agenda }} <br>
                    <span style="color: #555; font-size: 9pt;">
                        {{ \Carbon\Carbon::parse($surat->tgl_surat)->translatedFormat('d F Y') }}
                    </span>
                </td>
                <td>
                    {{-- Asal Surat Keluar = Bidang Pengirim --}}
                    {{ $surat->bidang ? $surat->bidang->nama_bidang : 'Sekretariat' }}
                </td>
                <td>{{ $surat->perihal }}</td>
                <td>
                    {{-- Di format Word, kolom paling kanan ini berisi Tujuan --}}
                    {{ $surat->tujuan }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center">Tidak ada data.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>
