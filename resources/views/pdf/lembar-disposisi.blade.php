<!DOCTYPE html>
<html>
<head>
    <title>Lembar Disposisi</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px; }
        .header h2 { margin: 0; text-transform: uppercase; }
        .header p { margin: 2px 0; }

        .box { border: 1px solid black; padding: 10px; margin-bottom: 10px; }
        .row { display: flex; width: 100%; margin-bottom: 5px; }
        .label { width: 120px; font-weight: bold; display: inline-block; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid black; padding: 5px; vertical-align: top; }

        .disposisi-item { margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>PEMERINTAH KOTA PONTIANAK</h2>
        <h2>{{ $config['instansi_name'] ?? 'BADAN KEUANGAN DAERAH' }}</h2>
        <p>LEMBAR DISPOSISI</p>
    </div>

    <div class="box">
        <div><span class="label">Nomor Agenda:</span> {{ $surat->no_agenda }}</div>
        <div><span class="label">Tanggal Terima:</span> {{ \Carbon\Carbon::parse($surat->tgl_terima)->translatedFormat('d F Y') }}</div>
        <div><span class="label">Tanggal Surat:</span> {{ \Carbon\Carbon::parse($surat->tgl_surat)->translatedFormat('d F Y') }}</div>
        <div><span class="label">Nomor Surat:</span> {{ $surat->no_surat }}</div>
        <div><span class="label">Asal Surat:</span> {{ $surat->pengirim }}</div>
        <div style="margin-top: 5px;"><span class="label">Perihal:</span><br>{{ $surat->perihal }}</div>
    </div>

    <h3>Riwayat Disposisi / Instruksi</h3>
    <table>
        <thead>
            <tr>
                <th width="20%">Dari / Tanggal</th>
                <th width="20%">Kepada</th>
                <th>Instruksi / Catatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($surat->disposisi as $d)
            <tr>
                <td>
                    <strong>{{ $d->dariUser->jabatan ?? $d->dariUser->name }}</strong><br>
                    <small>{{ \Carbon\Carbon::parse($d->tgl_disposisi)->format('d/m/Y') }}</small>
                </td>
                <td>
                    {{ $d->keUser->jabatan ?? $d->keUser->name }}
                </td>
                <td>
                    <strong>{{ strtoupper(str_replace('_', ' ', $d->sifat_disposisi)) }}</strong><br>
                    "{{ $d->instruksi }}"
                    @if($d->catatan)
                    <br><em>Balasan: {{ $d->catatan }}</em>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
