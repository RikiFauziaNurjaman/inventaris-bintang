<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Stok</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #333;
        }
        .header {
            margin-bottom: 14px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #0f172a;
        }
        .header p {
            margin: 5px 0;
            font-size: 10px;
            color: #64748b;
        }
        .summary {
            margin-bottom: 14px;
        }
        .summary td {
            width: 25%;
            border: 0;
            background: #f8fafc;
            padding: 8px;
        }
        .summary strong {
            display: block;
            margin-top: 3px;
            font-size: 16px;
            color: #0f172a;
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
            background-color: #e2e8f0;
            font-weight: bold;
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
        <h1>Ringkasan Stok Inventaris</h1>
        <p>Rekap per model dan lokasi · Dicetak {{ $tanggalCetak }}</p>
    </div>

    <table class="summary">
        <tr>
            <td>Total unit<strong>{{ number_format($summary->total ?? 0, 0, ',', '.') }}</strong></td>
            <td>Status baik<strong>{{ number_format($summary->baik ?? 0, 0, ',', '.') }}</strong></td>
            <td>Dipinjamkan<strong>{{ number_format($summary->dipinjamkan ?? 0, 0, ',', '.') }}</strong></td>
            <td>Rusak / perbaikan<strong>{{ number_format(($summary->rusak ?? 0) + ($summary->perbaikan ?? 0), 0, ',', '.') }}</strong></td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 30px;">NO</th>
                <th>Lokasi</th>
                <th>Barang</th>
                <th>Total</th>
                <th>Baik</th>
                <th>Dipinjamkan</th>
                <th>Rusak</th>
                <th>Perbaikan</th>
                <th>Terjual</th>
                <th>Dimusnahkan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($barangList as $index => $barang)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $barang->lokasi ?: '-' }}</td>
                    <td>
                        {{ trim(($barang->merek ?: '').' '.($barang->model ?: '')) ?: '-' }}<br>
                        <small>{{ collect([$barang->kategori, $barang->jenis])->filter()->join(' · ') ?: '-' }}</small>
                    </td>
                    <td class="text-center">{{ $barang->total }}</td>
                    <td class="text-center">{{ $barang->baik }}</td>
                    <td class="text-center">{{ $barang->dipinjamkan }}</td>
                    <td class="text-center">{{ $barang->rusak }}</td>
                    <td class="text-center">{{ $barang->perbaikan }}</td>
                    <td class="text-center">{{ $barang->terjual }}</td>
                    <td class="text-center">{{ $barang->dimusnahkan }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="text-center">Tidak ada data yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh Sistem Manajemen Inventaris
    </div>
</body>
</html>
