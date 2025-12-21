<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Buku Agenda Surat Masuk</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 10px; }
        .header h2 { margin: 0; font-size: 14pt; text-transform: uppercase; }
        .header h3 { margin: 5px 0; font-size: 12pt; font-weight: normal; }
        .info { text-align: center; font-weight: bold; margin-bottom: 15px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid black; padding: 6px; vertical-align: top; text-align: left; }
        th { background-color: #f2f2f2; text-align: center; font-weight: bold; }

        /* Utility */
        .text-center { text-align: center; }
        .no-wrap { white-space: nowrap; }
        .small { font-size: 10pt; }

        /* Print Settings */
        @media print {
            @page { size: landscape; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body onload="window.print()">

    <div class="header">
        <h2>PEMERINTAH KOTA PONTIANAK</h2>
        <h2>{{ $instansi }}</h2>
        <h3>Laporan Buku Agenda Surat Masuk</h3>
    </div>

    <div class="info">
        Periode: {{ $tgl_awal }} s/d {{ $tgl_akhir }}
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">No. Agenda</th>
                <th width="10%">Tanggal Terima</th>
                <th width="15%">Asal Surat</th>
                <th width="20%">No. Surat & Tanggal</th>
                <th>Perihal</th>
                <th width="12%">Diteruskan Ke</th>
                <th width="8%">Ket</th>
            </tr>
        </thead>
        <tbody>
            @forelse($surats as $index => $surat)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center">
                    <strong>{{ $surat->no_agenda }}</strong>
                </td>
                <td class="text-center">
                    {{ \Carbon\Carbon::parse($surat->tgl_terima)->format('d/m/Y') }}
                </td>
                <td>{{ $surat->pengirim }}</td>
                <td>
                    {{ $surat->no_surat }}<br>
                    <span class="small text-muted">{{ \Carbon\Carbon::parse($surat->tgl_surat)->format('d/m/Y') }}</span>
                </td>
                <td>{{ $surat->perihal }}</td>
                <td>
                    {{ $surat->bidangPenerima ? $surat->bidangPenerima->nama_bidang : 'Sekretariat' }}
                </td>
                <td class="text-center">
                    {{ ucfirst($surat->sifat_surat) }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="padding: 20px;">Tidak ada data surat pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 50px; float: right; width: 250px; text-align: center;">
        <p>Pontianak, {{ date('d F Y') }}</p>
        <p>Mengetahui,<br>Kepala Sub Bagian Umum</p>
        <br><br><br>
        <p style="text-decoration: underline; font-weight: bold;">( ................................. )</p>
        <p>NIP. .................................</p>
    </div>

</body>
</html>
