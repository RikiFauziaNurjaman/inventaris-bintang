<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Stok Distribusi</title>
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
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
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
        <h1>Laporan Ringkasan Stok Distribusi</h1>
        <p>Tanggal Cetak: {{ $tanggalCetak }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30px;">NO</th>
                <th>Lokasi</th>
                <th>Kategori</th>
                <th>Nama Barang</th>
                <th style="width: 60px;" class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @forelse($stokDistribusi as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item['lokasi'] }}</td>
                    <td>{{ $item['kategori'] }}</td>
                    <td>{{ $item['merek'] }} {{ $item['model'] }}</td>
                    <td class="text-right">{{ $item['jumlah_tersedia'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh Sistem Manajemen Inventaris - Ringkasan Stok Distribusi
    </div>
</body>
</html>
