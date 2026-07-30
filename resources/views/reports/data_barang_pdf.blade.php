<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Barang Inventaris</title>
    <style>
        @page { margin: 26px 28px 34px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #1e293b; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 12px; }
        h1 { margin: 0 0 4px; font-size: 18px; color: #0f172a; }
        .meta { color: #64748b; }
        .filters { margin: 0 0 12px; padding: 8px 10px; background: #f1f5f9; border-radius: 4px; }
        .filters span { margin-right: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; }
        th { background: #e2e8f0; color: #334155; font-size: 8px; text-align: left; text-transform: uppercase; }
        tr:nth-child(even) td { background: #f8fafc; }
        .center { text-align: center; }
        .serial { font-family: DejaVu Sans Mono, monospace; }
        .muted { color: #64748b; font-size: 8px; }
        .footer { position: fixed; right: 0; bottom: -18px; left: 0; text-align: center; color: #94a3b8; font-size: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Data Barang Inventaris</h1>
        <div class="meta">{{ number_format($barangList->count(), 0, ',', '.') }} unit · Dicetak {{ $tanggalCetak }}</div>
    </div>

    @if(collect($filters)->filter()->isNotEmpty())
        <div class="filters">
            <strong>Filter aktif:</strong>
            @foreach($filters as $label => $value)
                @if($value)
                    <span>{{ ucfirst($label) }}: {{ $value }}</span>
                @endif
            @endforeach
        </div>
    @endif

    <table>
        <thead>
            <tr>
                <th style="width: 24px">No</th>
                <th style="width: 110px">Serial Number</th>
                <th>Barang</th>
                <th>Lokasi / Penempatan</th>
                <th style="width: 55px">Kondisi</th>
                <th style="width: 70px">Status</th>
                <th style="width: 90px">PIC</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($barangList as $index => $barang)
                @php
                    $model = $barang->modelBarang;
                    $statusKey = (string) $barang->status;
                    $penempatan = $barang->rak
                        ? trim($barang->rak->nama_rak.' · '.$barang->rak->kode_rak, ' ·')
                        : ($barang->subLokasi->nama ?? 'Tanpa penempatan rinci');
                    $status = [
                        'baik' => 'Baik',
                        'bagus' => 'Baik',
                        'rusak' => 'Rusak',
                        'diperbaiki' => 'Dalam perbaikan',
                        'maintenance' => 'Maintenance',
                        'dipinjamkan' => 'Dipinjamkan',
                        'dijual' => 'Dijual',
                        'menunggu' => 'Menunggu',
                        'dimusnahkan' => 'Dimusnahkan',
                    ][$statusKey] ?? ucfirst(str_replace('_', ' ', $statusKey));
                @endphp
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td class="serial">{{ $barang->serial_number }}</td>
                    <td>
                        <strong>{{ trim(($model?->merek?->nama ?? '').' '.($model?->nama ?? '')) ?: '-' }}</strong><br>
                        <span class="muted">{{ $model?->kategori?->nama ?? '-' }} · {{ $model?->jenis?->nama ?? '-' }}</span>
                    </td>
                    <td>
                        {{ $barang->lokasi->nama ?? '-' }}<br>
                        <span class="muted">{{ $penempatan }}</span>
                    </td>
                    <td>{{ $barang->kondisi_awal === 'baru' ? 'Baru' : 'Second' }}</td>
                    <td>{{ $status }}</td>
                    <td>{{ $barang->pic ?: '-' }}</td>
                    <td>{{ $barang->catatan ?: '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="center">Tidak ada data yang sesuai.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Dicetak oleh Sistem Manajemen Inventaris</div>
</body>
</html>
