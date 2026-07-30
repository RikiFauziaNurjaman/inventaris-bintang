<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Hasil Stock Opname {{ $opname->id }}</title>
    <style>
        @page { margin: 22px 28px 38px; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: #172033;
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8.5px;
            line-height: 1.4;
        }
        .header-table, .meta-table, .summary-table, .signature-table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table { border-bottom: 2px solid #2563eb; margin-bottom: 14px; }
        .header-table td { padding: 0 0 10px; vertical-align: middle; }
        .logo { width: 44px; height: 50px; object-fit: contain; }
        .company { margin: 0; color: #0f172a; font-size: 15px; font-weight: bold; letter-spacing: .3px; }
        .system-name { margin: 2px 0 0; color: #64748b; font-size: 8px; text-transform: uppercase; letter-spacing: .8px; }
        .document-title { margin: 0; color: #0f172a; font-size: 16px; font-weight: bold; text-align: right; text-transform: uppercase; }
        .document-number { margin: 3px 0 0; color: #64748b; font-size: 8px; text-align: right; }
        .approved-label {
            display: inline-block;
            margin-top: 5px;
            padding: 3px 8px;
            border: 1px solid #86efac;
            border-radius: 10px;
            background: #dcfce7;
            color: #166534;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .section-title {
            margin: 13px 0 6px;
            color: #1d4ed8;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: .5px;
        }
        .meta-table { border: 1px solid #dbe2ea; }
        .meta-table td { width: 25%; padding: 7px 9px; border-right: 1px solid #dbe2ea; vertical-align: top; }
        .meta-table td:last-child { border-right: 0; }
        .label { display: block; margin-bottom: 2px; color: #64748b; font-size: 7px; text-transform: uppercase; }
        .value { color: #0f172a; font-weight: bold; }
        .summary-table { table-layout: fixed; border-spacing: 5px; border-collapse: separate; margin: 0 -5px; }
        .summary-table td { padding: 8px; border: 1px solid #dbe2ea; border-radius: 4px; background: #f8fafc; text-align: center; }
        .summary-number { display: block; color: #0f172a; font-size: 15px; font-weight: bold; }
        .summary-label { display: block; margin-top: 1px; color: #64748b; font-size: 7px; text-transform: uppercase; }
        .note {
            margin-top: 8px;
            padding: 7px 9px;
            border-left: 3px solid #2563eb;
            background: #eff6ff;
            color: #334155;
        }
        .result-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .result-table thead { display: table-header-group; }
        .result-table tr { page-break-inside: avoid; }
        .result-table th {
            padding: 6px 5px;
            border: 1px solid #cbd5e1;
            background: #eaf1fb;
            color: #1e3a5f;
            font-size: 7px;
            text-align: left;
            text-transform: uppercase;
        }
        .result-table td { padding: 5px; border: 1px solid #dbe2ea; vertical-align: top; overflow-wrap: break-word; }
        .result-table tbody tr:nth-child(even) { background: #f8fafc; }
        .text-center { text-align: center !important; }
        .serial { color: #0f172a; font-family: 'DejaVu Sans Mono', monospace; font-weight: bold; }
        .muted { color: #64748b; }
        .result {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 8px;
            font-size: 6.5px;
            font-weight: bold;
            white-space: nowrap;
        }
        .found { background: #dcfce7; color: #166534; }
        .pending { background: #e2e8f0; color: #475569; }
        .wrong_location { background: #fef3c7; color: #92400e; }
        .unexpected { background: #ffedd5; color: #9a3412; }
        .unknown { background: #fee2e2; color: #991b1b; }
        .conclusion { margin-top: 10px; padding: 9px; border: 1px solid #dbe2ea; background: #f8fafc; }
        .conclusion strong { color: #0f172a; }
        .signature-table { margin-top: 22px; page-break-inside: avoid; }
        .signature-table td { width: 33.33%; padding: 0 18px; text-align: center; vertical-align: top; }
        .signature-space { height: 42px; }
        .signature-name { padding-top: 3px; border-top: 1px solid #64748b; color: #0f172a; font-weight: bold; }
        .footer {
            position: fixed;
            right: 0;
            bottom: -25px;
            left: 0;
            border-top: 1px solid #dbe2ea;
            padding-top: 5px;
            color: #64748b;
            font-size: 6.5px;
            text-align: center;
        }
    </style>
</head>
<body>
    @php
        $stateLabels = [
            'pending' => 'Belum ditemukan',
            'found' => 'Ditemukan',
            'wrong_location' => 'Salah lokasi',
            'unexpected' => 'Tidak diharapkan',
            'unknown' => 'Tidak terdaftar',
        ];
        $documentNumber = 'SO/'.$opname->tanggal->format('Y').'/'.str_pad((string) $opname->id, 5, '0', STR_PAD_LEFT);
    @endphp

    <table class="header-table">
        <tr>
            <td style="width: 55px;">
                <img class="logo" src="{{ public_path('images/logo-surat.png') }}" alt="">
            </td>
            <td>
                <p class="company">CV. BINTANG TEKNOLOGI</p>
                <p class="system-name">Sistem Manajemen Inventaris</p>
            </td>
            <td style="width: 48%;">
                <p class="document-title">Laporan Hasil Audit Stock Opname</p>
                <p class="document-number">Nomor dokumen: {{ $documentNumber }}</p>
                <div style="text-align: right;"><span class="approved-label">Disetujui</span></div>
            </td>
        </tr>
    </table>

    <p class="section-title">Informasi Audit</p>
    <table class="meta-table">
        <tr>
            <td>
                <span class="label">Lokasi pemeriksaan</span>
                <span class="value">{{ $opname->lokasi?->nama ?? '-' }}</span>
                @if($opname->lokasi?->alamat)
                    <br><span class="muted">{{ $opname->lokasi->alamat }}</span>
                @endif
            </td>
            <td>
                <span class="label">Tanggal opname</span>
                <span class="value">{{ $opname->tanggal->translatedFormat('d F Y') }}</span>
            </td>
            <td>
                <span class="label">Pembuat sesi</span>
                <span class="value">{{ $opname->user?->name ?? '-' }}</span>
            </td>
            <td>
                <span class="label">Disetujui oleh</span>
                <span class="value">{{ $opname->approvedBy?->name ?? '-' }}</span>
                <br><span class="muted">{{ $opname->approved_at?->translatedFormat('d F Y, H:i') ?? '-' }}</span>
            </td>
        </tr>
    </table>

    @if($progress)
        <p class="section-title">Ringkasan Hasil</p>
        <table class="summary-table">
            <tr>
                <td><span class="summary-number">{{ $progress['expected'] }}</span><span class="summary-label">Expected</span></td>
                <td><span class="summary-number">{{ $progress['found'] }}</span><span class="summary-label">Ditemukan</span></td>
                <td><span class="summary-number">{{ $progress['pending'] }}</span><span class="summary-label">Belum ditemukan</span></td>
                <td><span class="summary-number">{{ $progress['wrong_location'] }}</span><span class="summary-label">Salah lokasi</span></td>
                <td><span class="summary-number">{{ $progress['unexpected'] }}</span><span class="summary-label">Tidak diharapkan</span></td>
                <td><span class="summary-number">{{ $progress['unknown'] }}</span><span class="summary-label">Tidak terdaftar</span></td>
                <td><span class="summary-number">{{ $progress['percent'] }}%</span><span class="summary-label">Terverifikasi</span></td>
            </tr>
        </table>
        <div class="note">
            <strong>Petugas pemeriksa:</strong>
            {{ $progress['contributors']->pluck('name')->join(', ') ?: 'Belum tercatat' }}
            @if($opname->catatan)
                &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Catatan sesi:</strong> {{ $opname->catatan }}
            @endif
        </div>

        <p class="section-title">Rincian Pemeriksaan Serial</p>
        <table class="result-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 3%;">No</th>
                    <th style="width: 13%;">Serial Number</th>
                    <th style="width: 20%;">Merek / Model</th>
                    <th style="width: 11%;">Status Awal</th>
                    <th style="width: 16%;">Lokasi Sistem</th>
                    <th style="width: 12%;">Hasil Audit</th>
                    <th style="width: 13%;">Petugas</th>
                    <th style="width: 12%;">Waktu Scan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($items as $index => $item)
                    @php
                        $model = trim(($item->modelBarang?->merek?->nama ?? '').' '.($item->modelBarang?->nama ?? ''));
                        $systemLocation = $item->barang?->lokasi?->nama
                            ?? (in_array($item->state, ['pending', 'found'], true) ? $opname->lokasi?->nama : null);
                    @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="serial">{{ $item->serial_number ?: '-' }}</td>
                        <td>
                            {{ $model ?: 'Model tidak tersedia' }}
                            @if($item->modelBarang?->kategori?->nama)
                                <br><span class="muted">{{ $item->modelBarang->kategori->nama }}</span>
                            @endif
                        </td>
                        <td>{{ $item->status_snapshot ?: '-' }}</td>
                        <td>{{ $systemLocation ?: '-' }}</td>
                        <td><span class="result {{ $item->state }}">{{ $stateLabels[$item->state] ?? $item->state }}</span></td>
                        <td>{{ $item->scannedBy?->name ?? '-' }}</td>
                        <td>{{ $item->scanned_at?->translatedFormat('d/m/Y H:i') ?? '-' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="text-center">Tidak ada rincian audit.</td></tr>
                @endforelse
            </tbody>
        </table>

        @php
            $discrepancies = $progress['pending'] + $progress['wrong_location'] + $progress['unexpected'] + $progress['unknown'];
        @endphp
        <div class="conclusion">
            <strong>Kesimpulan:</strong>
            {{ $progress['found'] }} dari {{ $progress['expected'] }} aset expected berhasil ditemukan.
            @if($discrepancies > 0)
                Terdapat {{ $discrepancies }} temuan yang memerlukan verifikasi atau tindak lanjut melalui transaksi inventaris resmi.
            @else
                Tidak terdapat selisih atau temuan yang memerlukan tindak lanjut.
            @endif
            Laporan ini merupakan rekaman audit dan tidak mengubah data stok secara otomatis.
        </div>
    @else
        <p class="section-title">Ringkasan Hasil Legacy</p>
        <table class="result-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 5%;">No</th>
                    <th>Model</th>
                    <th class="text-center">Jumlah Sistem</th>
                    <th class="text-center">Jumlah Fisik</th>
                    <th class="text-center">Selisih</th>
                    <th>Catatan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($opname->details as $index => $detail)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ trim(($detail->modelBarang?->merek?->nama ?? '').' '.($detail->modelBarang?->nama ?? '')) ?: '-' }}</td>
                        <td class="text-center">{{ $detail->jumlah_sistem }}</td>
                        <td class="text-center">{{ $detail->jumlah_fisik }}</td>
                        <td class="text-center">{{ $detail->selisih }}</td>
                        <td>{{ $detail->catatan ?: '-' }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="text-center">Tidak ada rincian audit.</td></tr>
                @endforelse
            </tbody>
        </table>
    @endif

    <table class="signature-table">
        <tr>
            <td>
                Pembuat Sesi,
                <div class="signature-space"></div>
                <div class="signature-name">{{ $opname->user?->name ?? '(................................)' }}</div>
            </td>
            <td>
                Penyetuju Audit,
                <div class="signature-space"></div>
                <div class="signature-name">{{ $opname->approvedBy?->name ?? '(................................)' }}</div>
            </td>
            <td>
                Perwakilan {{ $opname->lokasi?->nama ?? 'Lokasi' }},
                <div class="signature-space"></div>
                <div class="signature-name">(................................)</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dokumen {{ $documentNumber }} · Dicetak {{ now()->translatedFormat('d F Y, H:i') }} oleh {{ $printedBy->name }} · Sistem Manajemen Inventaris
    </div>
</body>
</html>
