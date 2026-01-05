<!DOCTYPE html>

<html>

<head>

    <title>Lembar Disposisi</title>

    <style>
        @page {
            margin: 10mm 15mm;
        }

        body {

            font-family: Arial, sans-serif;

            font-size: 10pt;

            margin: 0;

            padding: 0;

            color: #000;

        }



        /* Judul Halaman */

        .judul-halaman {

            text-align: center;

            font-weight: bold;

            font-size: 12pt;

            text-transform: uppercase;

            margin-bottom: 10px;

        }



        /* SATU TABEL UTAMA UNTUK SEMUA */

        table.grid-table {

            width: 100%;

            border-collapse: collapse;

            border: 2px solid #000;
            /* Garis luar tebal */

            table-layout: fixed;

        }



        table.grid-table td {

            border: 1px solid #000;
            /* Garis dalam */

            padding: 4px 6px;

            vertical-align: top;

            word-wrap: break-word;

        }



        /* Kolom Kiri (Label) - Lebar fix biar rapi */

        .col-kiri {
            width: 45%;
        }

        /* Kolom Kanan (Isi) */

        .col-kanan {
            width: 55%;
        }



        .bold {
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }



        /* Font khusus instruksi */

        .handwriting {

            font-family: "Courier New", monospace;

            font-size: 11pt;

            font-weight: bold;

            display: block;

            margin-top: 5px;

        }



        .ttd-box {

            margin-top: 15px;

            text-align: center;

        }



        .ttd-name {

            font-weight: bold;

            text-decoration: underline;

            margin-top: 40px;

        }



        /* Helper untuk baris label titik dua (:) */

        .label-row {

            display: flex;

            justify-content: space-between;

        }
    </style>

</head>

<body>

    <div style="text-align:center; border-bottom:3px double #000; padding-bottom:5px; margin-bottom:10px;">
        <h2 style="margin:0; font-size:14pt; font-weight:bold; text-transform:uppercase;">
            {{ $config['instansi_nama'] ?? 'PEMERINTAH DAERAH' }}
        </h2>
        <p style="margin:2px 0; font-size:9pt;">
            {{ $config['instansi_alamat'] ?? 'Alamat Instansi' }}
        </p>
    </div>


    <div class="judul-halaman">LEMBAR DISPOSISI</div>



    @php

        // 1. DATA KABAN (Level 1) -> Wajib masuk kotak tengah

        $dispKaban = $surat->disposisi->first(function ($d) {
            return $d->dariUser && ($d->dariUser->role === 'level_1' || $d->dariUser->role === 'super_admin');
        });

        // 2. DATA KABID (Level 2) -> Wajib masuk kotak bawah

        // Logic ini mengatasi masalah "Bypass" (langsung ke bidang).

        // Walaupun dia urutan pertama, karena role-nya Level 2, dia akan dipaksa tampil di kotak bawah.

        $dispKabid = $surat->disposisi->first(function ($d) {
            return $d->dariUser && $d->dariUser->role === 'level_2';
        });

    @endphp



    <table class="grid-table">

        <tr>

            <td class="col-kiri">

                <a class="bold">Sekretaris/Kasubbag Umum dan Aparatur</a>

                <br><br>

                <div class="label-row">

                    <span>Diterima surat dari</span>

                    <span>:</span>

                </div>

                <br><br>

                <div class="label-row">

                    <span>Hari/Tanggal</span>

                    <span>:</span>

                </div>

            </td>

            <td class="col-kanan bold">

                <br><br>

                {{ $surat->pengirim }}



                <br><br>

                {{ \Carbon\Carbon::parse($surat->tgl_terima)->translatedFormat('l, d F Y') }}

            </td>

        </tr>



        <tr>

            <td class="col-kiri">

                <div class="label-row">

                    <span>No./Tanggal Surat</span>

                    <span>:</span>

                </div>

            </td>

            <td class="col-kanan">

                {{ $surat->no_surat }} <br>

                <span style="font-size: 9pt;">(Tgl:
                    {{ \Carbon\Carbon::parse($surat->tgl_surat)->translatedFormat('d F Y') }})</span>

            </td>

        </tr>



        <tr>

            <td class="col-kiri" style="height: 80px;">

                <div class="label-row">

                    <span>Hal</span>

                    <span>:</span>

                </div>

            </td>

            <td class="col-kanan bold">

                {{ $surat->perihal }}

                <div style="font-weight: normal; font-size: 9pt; margin-top: 5px;">

                    No. Agenda: <strong>{{ $surat->no_agenda }}</strong> | Sifat: {{ ucfirst($surat->sifat_surat) }}

                </div>

            </td>

        </tr>



        <tr>

            <td class="col-kiri" style="height: 40px;">

                Sekretaris/Kasubbag Umum dan Aparatur

                <br><br>



                Diteruskan ke Kepala Badan Keuangan <br> Dan Aset Daerah

                <br><br>

                <div class="label-row" style="width: 200px;">

                    <span>Hari/Tanggal</span>

                    <span>: {{ \Carbon\Carbon::parse($surat->tgl_terima)->format('d-m-Y') }}</span>

                </div>

            </td>

            <td class="col-kanan">

            </td>

        </tr>



        <tr>

            <td class="col-kiri" style="height: 130px;">

                Diterima Dari Kepala Badan Keuangan <br> Dan Aset Daerah

                <br><br>

                <div class="label-row" style="width: 150px;">

                    <span>Hari/Tanggal</span>

                    <span>:</span>

                </div>

                <br><br>

                Kepala Badan Keuangan Dan Aset Daerah

            </td>

            <td class="col-kanan">

                @if ($dispKaban)
                    <div style="border-bottom: 1px dashed #ccc; padding-bottom: 2px;">

                        <span style="font-size: 9pt;">Yth:
                            {{ $dispKaban->keUser->jabatan ?? $dispKaban->keUser->name }}</span>

                    </div>



                    <div class="handwriting">"{{ $dispKaban->instruksi }}"</div>



                    <div class="ttd-box">

                        <div>Pontianak,
                            {{ \Carbon\Carbon::parse($dispKaban->tgl_disposisi)->translatedFormat('d F Y') }}</div>

                        <div class="ttd-name">{{ $dispKaban->dariUser->name }}</div>

                    </div>
                @else
                    <div style="text-align: center; color: #ccc; margin-top: 40px;">

                        (Langsung ke Bidang / Tidak ada Disposisi Kaban)

                    </div>
                @endif

            </td>

        </tr>



        <tr>

            <td class="col-kiri" style="height: 50px;">

                <strong>Sekretaris/Kasubbag Umum dan Aparatur</strong> <br>

                Diteruskan Ke Sekretaris/Kabid-Kabid

                <br><br>

                <div class="label-row" style="width: 150px;">

                    <span>Hari/Tanggal</span>

                    <span>:</span>

                </div>

                <br><br>

                SEKRETARIS/KEPALA BIDANG-BIDANG

            </td>

            <td class="col-kanan">

            </td>

        </tr>



        <tr>

            <td class="col-kiri" style="height: 130px;">

                Diterima dari Sekretaris/Kabid-Kabid

                <br><br>

                <div class="label-row" style="width: 150px;">

                    <span>Hari/Tanggal</span>

                    <span>:</span>

                </div>

                <br><br>



                KASUBBAG/KASUBBID

            </td>

            <td class="col-kanan">

                @if ($dispKabid)

                    <div style="border-bottom: 1px dashed #ccc; padding-bottom: 2px;">

                        <span style="font-size: 9pt;">Yth: {{ $dispKabid->keUser->name }}
                            ({{ $dispKabid->keUser->jabatan }})</span>

                    </div>



                    <div class="handwriting">"{{ $dispKabid->instruksi }}"</div>



                    @if ($dispKabid->catatan)
                        <div style="font-size: 9pt; font-style: italic; margin-top: 5px;">

                            Laporan Staf: {{ $dispKabid->catatan }}

                        </div>
                    @endif



                    <div class="ttd-box">

                        <div>Pontianak,
                            {{ \Carbon\Carbon::parse($dispKabid->tgl_disposisi)->translatedFormat('d F Y') }}</div>

                        <div class="ttd-name">{{ $dispKabid->dariUser->name }}</div>

                    </div>
                @else
                    <div style="text-align: center; color: #ccc; margin-top: 40px;">

                        (Belum ada disposisi Kabid)

                    </div>

                @endif

            </td>

        </tr>



    </table>



</body>

</html>
