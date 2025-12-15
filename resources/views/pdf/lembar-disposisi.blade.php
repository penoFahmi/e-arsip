<!DOCTYPE html>
<html>
<head>
    <title>Lembar Disposisi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            padding: 6px;
            border: 1px solid #000;
            margin-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            border: 1px solid #000;
            padding: 6px;
            vertical-align: top;
        }

        .left {
            width: 45%;
        }

        .right {
            width: 55%;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 6px;
        }

        .row {
            margin-bottom: 6px;
        }

        .ttd-box {
            height: 90px;
            position: relative;
        }

        .ttd-bottom {
            position: absolute;
            bottom: 5px;
            left: 6px;
            right: 6px;
            font-weight: bold;
        }

        .right-align {
            text-align: right;
        }

        .italic-blue {
            font-family: "Times New Roman", serif;
            font-style: italic;
            color: blue;
        }
    </style>
</head>
<body>

    <div class="header-kop">
        <h3>PEMERINTAH KOTA PONTIANAK</h3>
        <h2>{{ $config['instansi_name'] ?? 'NAMA INSTANSI (Setting di Admin)' }}</h2>
        <span style="font-size: 10px; font-weight: normal;">
            {{ $config['instansi_address'] ?? 'Alamat Instansi belum diatur.' }}
        </span>
        <hr style="border: 1px solid #000; margin-top: 5px;">
    </div>

    <div class="title" style="text-align: center; font-weight: bold; margin-bottom: 10px;">LEMBAR DISPOSISI</div>

    <table>
        <tr>
            <td width="45%">
                <div class="bold" style="margin-bottom: 10px;">
                    {{ $config['disp_level_1_title'] ?? 'Pejabat Level 1' }}
                </div>

                <table style="width: 100%; border: none; margin: 0;">
                    <tr><td style="border:none; padding:2px;">Diterima dari</td><td style="border:none; padding:2px;">:</td></tr>
                    <tr><td style="border:none; padding:2px;">Hari/Tanggal</td><td style="border:none; padding:2px;">:</td></tr>
                    <tr><td style="border:none; padding:2px;">No/Tgl Surat</td><td style="border:none; padding:2px;">:</td></tr>
                    <tr><td style="border:none; padding:2px;">Hal</td><td style="border:none; padding:2px;">:</td></tr>
                </table>
            </td>
            <td width="55%">
                <div style="margin-top: 25px;">{{ $surat->pengirim }}</div>
                <div style="margin-top: 5px;">{{ \Carbon\Carbon::parse($surat->tgl_terima)->format('d/m/Y') }}</div>
                <div style="margin-top: 15px;">{{ $surat->no_surat }}</div>
                <div style="margin-top: 15px;">{{ $surat->perihal }}</div>
            </td>
        </tr>

        <tr>
            <td>
                <div class="bold">{{ $config['disp_level_1_title'] ?? 'Pejabat Level 1' }}</div>
                <div style="margin-top: 10px; margin-bottom: 20px;">
                    Diteruskan ke: <br>
                    <strong>{{ $config['disp_level_2_title'] ?? 'Pejabat Level 2 (Kepala Badan)' }}</strong>
                </div>
                <div>Hari/Tanggal : ......................</div>
            </td>
            <td>
                 @php $d1 = $surat->disposisi->first(); @endphp
                 @if($d1)
                    <div style="color: blue; font-style: italic;">{{ $d1->instruksi }}</div>
                 @endif
            </td>
        </tr>

        <tr>
            <td style="height: 100px; position: relative;">
                <div>Diterima dari: <br> <strong>{{ $config['disp_level_2_title'] ?? 'Pejabat Level 2' }}</strong></div>

                <div style="position: absolute; bottom: 5px; font-weight: bold;">
                    {{ strtoupper($config['disp_level_2_title'] ?? 'KEPALA BADAN') }}
                </div>
            </td>
            <td>
                 @php $d2 = $surat->disposisi->skip(1)->first(); @endphp
                 @if($d2)
                    <div style="color: blue; font-style: italic;">{{ $d2->instruksi }}</div>
                 @endif
            </td>
        </tr>

        <tr>
            <td style="height: 100px; position: relative;">
                <div class="bold">{{ $config['disp_level_3_title'] ?? 'Pejabat Level 3' }}</div>
                <div style="margin-top: 5px;">Diteruskan ke Pejabat Teknis</div>

                <div style="position: absolute; bottom: 5px; font-weight: bold;">
                    {{ strtoupper($config['disp_level_3_title'] ?? 'KABID') }}
                </div>
            </td>
            <td>
                 @php $d3 = $surat->disposisi->skip(2)->first(); @endphp
                 @if($d3)
                    <div style="color: blue; font-style: italic;">{{ $d3->instruksi }}</div>
                 @endif
            </td>
        </tr>
    </table>
</body>
</html>
