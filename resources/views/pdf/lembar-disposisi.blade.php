<!DOCTYPE html>
<html>
<head>
    <title>Lembar Disposisi</title>
    <style>
        @page { margin: 14mm 12mm; }
        body{
            font-family: Arial, sans-serif;
            font-size: 11pt;
            margin:0;
            padding:0;
            color:#000;
        }

        /* KOP (permintaan kantor) */
        .kop{
            text-align:center;
            padding-bottom:8px;
            margin-bottom:6px;
            border-bottom:3px double #000;
        }
        .kop h2{
            margin:0;
            font-size:14pt;
            text-transform:uppercase;
            font-weight:700;
            line-height:1.15;
        }
        .kop p{
            margin:2px 0;
            font-size:10pt;
            line-height:1.2;
        }

        /* Judul di tengah seperti form */
        .judul{
            text-align:center;
            margin:8px 0 8px 0;
            font-weight:700;
            font-size:12pt;
            letter-spacing:.5px;
        }

        /* Tabel form */
        table.utama{
            width:100%;
            border-collapse:collapse;
            border:2px solid #000;      /* garis luar tebal */
            table-layout:fixed;
        }
        table.utama td{
            border:1px solid #000;      /* garis dalam tipis */
            padding:6px 8px;
            vertical-align:top;
            word-wrap:break-word;
        }

        /* Kolom kiri pakai ':' rata kanan */
        .label{
            position:relative;
            padding-right:16px;
        }
        .label:after{
            content:":";
            position:absolute;
            right:6px;
            top:6px;
        }

        .text-center{ text-align:center; }
        .text-bold{ font-weight:700; }

        /* Tulisan instruksi seperti tinta */
        .handwriting{
            font-family:"Courier New", monospace;
            font-style:italic;
            font-weight:600;
            color:#000;
        }

        /* Pengunci tinggi baris supaya mirip form walau isi sedikit */
        .h-34{ height:34px; }
        .h-48{ height:48px; }
        .h-58{ height:58px; }
        .h-70{ height:70px; }
        .h-80{ height:80px; }

        /* Area tanda tangan: teks di bawah */
        .sign-cell{
            height:80px;
            vertical-align:bottom;
        }
        .sign-name{ margin-top:6px; font-weight:700; }

        /* Baris footer kiri (SEKRETARIS/KABID dan KASUBBAG) di tengah kolom */
        .footer-left{
            height:70px;
            vertical-align:middle;
            text-align:center;
            font-weight:700;
        }
    </style>
</head>
<body>

    <div class="kop">
        <h2>{{ $config['instansi_nama'] ?? 'PEMERINTAH DAERAH' }}</h2>
        <p>{{ $config['instansi_alamat'] ?? 'Alamat Instansi' }}</p>
    </div>

    <div class="judul">LEMBAR DISPOSISI</div>

    <table class="utama">
        <tr>
            <td width="40%" class="text-bold h-34">
                {{ $config['label_level_1'] ?? 'KEPALA BADAN' }}
            </td>
            <td width="60%" class="text-bold h-34">
                {{ $surat->pengirim }}
            </td>
        </tr>

        <tr>
            <td class="label h-34">Diterima surat dari</td>
            <td class="h-34">{{ $surat->pengirim }}</td>
        </tr>

        <tr>
            <td class="label h-34">Hari/Tanggal</td>
            <td class="h-34">
                {{ \Carbon\Carbon::parse($surat->tgl_terima)->translatedFormat('l, d F Y') }}
            </td>
        </tr>

        <tr>
            <td class="label h-48">No/Tanggal Surat</td>
            <td class="h-48">
                {{ $surat->no_surat }}<br>
                <span style="font-size:10pt;">
                    (Tgl: {{ \Carbon\Carbon::parse($surat->tgl_surat)->translatedFormat('d F Y') }})
                </span>
            </td>
        </tr>

        <tr>
            <td class="label h-70">Hal</td>
            <td class="h-70">
                {{ $surat->perihal }}<br>
                <strong>(No. Agenda: {{ $surat->no_agenda }})</strong>
                <br>
                <span style="font-size:10pt;">Sifat: {{ ucfirst($surat->sifat_surat) }}</span>
            </td>
        </tr>

        @php
            // 1. Cari Disposisi Kaban (Level 1)
            $dispKaban = $surat->disposisi->first(function($d) {
                return $d->dariUser && ($d->dariUser->role === 'level_1' || $d->dariUser->role === 'super_admin');
            });

            // 2. Cari Disposisi Lanjutan (Kabid/Level 2)
            // Logic: Cari disposisi yang 'parent_id'-nya adalah ID disposisi Kaban
            $dispLanjutan = null;
            if ($dispKaban) {
                $dispLanjutan = $surat->disposisi->where('parent_id', $dispKaban->id)->first();
            }
        @endphp

        <tr>
            <td class="h-70">
                <div class="text-bold">{{ $config['label_level_1'] ?? 'KEPALA BADAN' }}</div>
                <div>Diteruskan ke {{ $config['label_level_2'] ?? 'Sekretaris / Kabid' }}</div>
                <div class="label" style="display:inline-block; width:calc(100% - 2px);">Hari/Tanggal</div>
            </td>
            <td class="h-70">
                @if($dispKaban)
                    <div><strong>Kepada:</strong> {{ $dispKaban->keUser->jabatan ?? $dispKaban->keUser->name }}</div>
                    <div class="handwriting" style="margin-top:4px;">"{{ $dispKaban->instruksi }}"</div>
                    @if($dispKaban->batas_waktu)
                       <div style="font-size:9pt; color:red;">Batas: {{ \Carbon\Carbon::parse($dispKaban->batas_waktu)->format('d/m/Y') }}</div>
                    @endif
                @else
                    <span style="color:#bbb;">(Belum ada disposisi pimpinan)</span>
                @endif
            </td>
        </tr>

        <tr>
            <td class="h-58">
                <div>Diterima dari {{ $config['label_level_2'] ?? 'Sekretaris / Kabid' }}</div>
                <div class="label" style="display:inline-block; width:calc(100% - 2px);">Hari/Tanggal</div>
            </td>
            <td class="sign-cell">
                @if($dispKaban)
                    <div>Pontianak, {{ \Carbon\Carbon::parse($dispKaban->tgl_disposisi)->translatedFormat('d F Y') }}</div>
                    <div class="sign-name">( {{ $dispKaban->dariUser->name }} )</div>
                @else
                    &nbsp;
                @endif
            </td>
        </tr>

        <tr>
            <td class="h-70">
                <div class="text-bold">{{ $config['label_level_2'] ?? 'SEKRETARIS / KABID' }}</div>
                <div>Diteruskan ke Kasubbag/Kasubbid</div>
                <div class="label" style="display:inline-block; width:calc(100% - 2px);">Hari/Tanggal</div>
            </td>
            <td class="h-70">
                @if($dispLanjutan)
                    <div><strong>Kepada:</strong> {{ $dispLanjutan->keUser->name }}</div>
                    <div class="handwriting" style="margin-top:4px;">"{{ $dispLanjutan->instruksi }}"</div>

                    @if($dispLanjutan->catatan)
                        <div style="margin-top:4px; font-size:9pt; border-top:1px dashed #ccc;">
                            <em>Lap: {{ $dispLanjutan->catatan }}</em>
                        </div>
                    @endif
                @else
                    &nbsp;
                @endif
            </td>
        </tr>

        <tr>
            <td class="footer-left">SEKRETARIS/KEPALA BIDANG-BIDANG</td>
            <td class="sign-cell">
                @if($dispLanjutan)
                    <div>Tanggal: {{ \Carbon\Carbon::parse($dispLanjutan->tgl_disposisi)->translatedFormat('d F Y') }}</div>
                    <div class="sign-name">( {{ $dispLanjutan->dariUser->name }} )</div>
                @else
                    &nbsp;
                @endif
            </td>
        </tr>

        <tr>
            <td class="h-58">
                <div>Diterima dari Sekretaris/Kabid-Kabid</div>
                <div class="label" style="display:inline-block; width:calc(100% - 2px);">Hari/Tanggal</div>
            </td>
            <td class="h-58">
                &nbsp;
            </td>
        </tr>

        <tr>
            <td class="footer-left">KASUBBAG/KASUBBID</td>
            <td class="h-70">&nbsp;</td>
        </tr>
    </table>

</body>
</html>
