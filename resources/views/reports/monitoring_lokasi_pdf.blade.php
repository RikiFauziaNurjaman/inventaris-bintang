<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Monitoring Lokasi - {{ $lokasi->nama }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0;
            font-size: 12px;
        }
        .info {
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN MONITORING PRINTER</h1>
        <p>LOKASI: {{ strtoupper($lokasi->nama) }}</p>
        <p>TANGGAL CETAK: {{ strtoupper($tanggalCetak) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30px;">NO</th>
                <th>NAMA PRINTER</th>
                <th>SERIAL NUMBER</th>
                <th>JENIS PRINTER</th>
                <th>TANGGAL PENEMPATAN</th>
                <th>UNIT PENEMPATAN</th>
            </tr>
        </thead>
        <tbody>
            @forelse($barangList as $index => $barang)
                @php
                    $latestMutasi = $barang->mutasi->first();
                    $tanggalPenempatan = $latestMutasi ? \Carbon\Carbon::parse($latestMutasi->tanggal)->translatedFormat('d F Y') : '-';
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ strtoupper(($barang->modelBarang->merek->nama ?? '') . ' ' . ($barang->modelBarang->nama ?? '')) }}</td>
                    <td>{{ $barang->serial_number ?: '-' }}</td>
                    <td>{{ strtoupper($barang->modelBarang->jenis->nama ?? '-') }}</td>
                    <td class="text-center">{{ strtoupper($tanggalPenempatan) }}</td>
                    <td>{{ strtoupper($barang->subLokasi->nama ?? '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center">Tidak ada data yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh Sistem Manajemen Inventaris - Laporan Monitoring Printer
    </div>
</body>
</html>
