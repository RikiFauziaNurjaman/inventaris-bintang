<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Barang Kembali</title>
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
        <h1>LAPORAN BARANG KEMBALI</h1>
        @if($lokasi)
            <p>LOKASI: {{ strtoupper($lokasi->nama) }}</p>
        @endif
        <p>PERIODE: {{ $filters['start_date'] ?? 'AWAL' }} S/D {{ $filters['end_date'] ?? 'AKHIR' }}</p>
        <p>TANGGAL CETAK: {{ strtoupper($tanggalCetak) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30px;">NO</th>
                <th>NAMA PRINTER</th>
                <th>SERIAL NUMBER</th>
                <th>JENIS PRINTER</th>
                <th>TANGGAL KEMBALI</th>
                @if(!$lokasi)
                    <th>LOKASI ASAL</th>
                @endif
                <th>UNIT PENEMPATAN</th>
            </tr>
        </thead>
        <tbody>
            @forelse($barangKembaliData as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ strtoupper($item->merek_nama_real == $item->model_nama_real ? $item->model_nama_real : ($item->merek_nama_real . ' ' . $item->model_nama_real)) }}</td>
                    <td>{{ $item->serial_number ?: '-' }}</td>
                    <td>{{ strtoupper($item->jenis_nama ?? '-') }}</td>
                    <td class="text-center">{{ $item->tanggal }}</td>
                    @if(!$lokasi)
                        <td>{{ strtoupper($item->lokasi_nama ?? '-') }}</td>
                    @endif
                    <td>{{ strtoupper($item->sub_lokasi_nama ?? '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $lokasi ? 6 : 7 }}" class="text-center">Tidak ada data yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh Sistem Manajemen Inventaris - Laporan Barang Kembali
    </div>
</body>
</html>
