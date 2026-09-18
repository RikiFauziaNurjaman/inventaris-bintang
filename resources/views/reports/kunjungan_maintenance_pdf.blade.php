<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Berita Acara Kunjungan Maintenance - {{ $kunjungan->nomor_kunjungan }}</title>
    <style>
        @page {
            margin: 18mm 14mm 18mm 14mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8.5px;
            line-height: 1.35;
            color: #1e293b;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }
        .company-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .system-name {
            font-size: 9px;
            color: #64748b;
            margin: 2px 0 0 0;
        }
        .doc-title {
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            color: #0284c7;
            margin: 0;
            text-transform: uppercase;
        }
        .doc-no {
            text-align: right;
            font-size: 9px;
            font-weight: bold;
            color: #334155;
            margin: 2px 0 0 0;
        }

        .meta-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .meta-grid td {
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            vertical-align: top;
            width: 50%;
        }
        .meta-label {
            font-size: 7.5px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }
        .meta-val {
            font-size: 9.5px;
            font-weight: 600;
            color: #0f172a;
        }
        .meta-sub {
            font-size: 8px;
            color: #475569;
        }

        .section-header {
            font-size: 10px;
            font-weight: bold;
            color: #0f172a;
            margin: 10px 0 5px 0;
            padding-bottom: 2px;
            border-bottom: 1px solid #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
            text-align: left;
        }
        table.data-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-baik { background-color: #dcfce7; color: #15803d; }
        .badge-perbaikan { background-color: #fef9c3; color: #a16207; }
        .badge-rusak { background-color: #fee2e2; color: #b91c1c; }

        .summary-box {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
        }
        .summary-box td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            font-size: 8.5px;
        }

        .catatan-box {
            background-color: #fff;
            border: 1px dashed #cbd5e1;
            padding: 6px 8px;
            margin-bottom: 15px;
            font-size: 8px;
            color: #334155;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            page-break-inside: avoid;
        }
        .signature-table td {
            border: none;
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 8.5px;
            color: #334155;
            padding: 0 20px;
        }
        .signature-space {
            height: 55px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
            color: #0f172a;
        }

        .footer {
            position: fixed;
            bottom: -10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
        }
    </style>
</head>
<body>
    <!-- Header Surat -->
    <table class="header-table">
        <tr>
            <td style="width: 55%;">
                <p class="company-name">PT. INTIWIJAYA KUSUMA</p>
                <p class="system-name">Sistem Manajemen Inventaris & Pemeliharaan Printer</p>
            </td>
            <td style="width: 45%;">
                <p class="doc-title">Berita Acara Kunjungan Maintenance</p>
                <p class="doc-no">No: {{ $kunjungan->nomor_kunjungan }}</p>
            </td>
        </tr>
    </table>

    <!-- Informasi Kunjungan & Pelanggan -->
    <table class="meta-grid">
        <tr>
            <td>
                <span class="meta-label">Lokasi / Pelanggan</span>
                <span class="meta-val">{{ strtoupper($kunjungan->lokasi->nama) }}</span>
                @if($kunjungan->lokasi->alamat)
                    <div class="meta-sub">{{ $kunjungan->lokasi->alamat }}</div>
                @endif
                <div style="margin-top: 4px;">
                    <span class="meta-label">PIC / Kontak di Lokasi</span>
                    <span class="meta-val">{{ $kunjungan->pic_lokasi ?: '-' }}</span>
                    @if($kunjungan->kontak_pic)
                        <span class="meta-sub">({{ $kunjungan->kontak_pic }})</span>
                    @endif
                </div>
            </td>
            <td>
                <span class="meta-label">Tanggal Pelaksanaan Kunjungan</span>
                <span class="meta-val">{{ \Carbon\Carbon::parse($kunjungan->tanggal_kunjungan)->translatedFormat('d F Y') }}</span>
                <div style="margin-top: 4px;">
                    <span class="meta-label">Teknisi Pelaksana</span>
                    <span class="meta-val">{{ $kunjungan->nama_teknisi }}</span>
                </div>
                <div style="margin-top: 4px;">
                    <span class="meta-label">Jadwal Kunjungan Berkala Berikutnya</span>
                    <span class="meta-val" style="color: #0284c7;">
                        {{ $kunjungan->jadwal_berikutnya ? \Carbon\Carbon::parse($kunjungan->jadwal_berikutnya)->translatedFormat('d F Y') : '-' }}
                        <span class="meta-sub">(Interval {{ $kunjungan->periode_bulan }} Bulan)</span>
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Detail Pemeriksaan Printer -->
    <div class="section-header">Hasil Pemeriksaan Unit Printer ({{ $kunjungan->details->count() }} Unit)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 22px;">No</th>
                <th style="width: 140px;">Unit Printer</th>
                <th style="width: 85px;">Serial Number</th>
                <th style="width: 85px;">Ruangan / Sub-Lokasi</th>
                <th style="width: 65px;">Kondisi</th>
                <th style="width: 50px;">Counter</th>
                <th>Pemeriksaan Komponen</th>
                <th>Tindakan / Solusi</th>
            </tr>
        </thead>
        <tbody>
            @php
                $cntBaik = 0;
                $cntPerlu = 0;
                $cntRusak = 0;
            @endphp
            @forelse($kunjungan->details as $index => $detail)
                @php
                    if ($detail->kondisi_fisik === 'baik') $cntBaik++;
                    elseif ($detail->kondisi_fisik === 'perlu_perbaikan') $cntPerlu++;
                    elseif ($detail->kondisi_fisik === 'rusak') $cntRusak++;

                    $modelName = trim(($detail->barang->modelBarang->merek->nama ?? '') . ' ' . ($detail->barang->modelBarang->nama ?? ''));
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ strtoupper($modelName ?: '-') }}</strong></td>
                    <td><code>{{ $detail->barang->serial_number ?: '-' }}</code></td>
                    <td>{{ $detail->subLokasi?->nama ?: 'Lokasi Utama' }}</td>
                    <td class="text-center">
                        @if($detail->kondisi_fisik === 'baik')
                            <span class="badge badge-baik">Baik</span>
                        @elseif($detail->kondisi_fisik === 'perlu_perbaikan')
                            <span class="badge badge-perbaikan">Perbaikan</span>
                        @else
                            <span class="badge badge-rusak">Rusak</span>
                        @endif
                        <div style="font-size: 7px; color: #64748b; margin-top: 1px;">
                            {{ $detail->status_operasional == 'normal' ? 'Operasional' : ($detail->status_operasional == 'gangguan_ringan' ? 'Terganggu' : 'Mati Total') }}
                        </div>
                    </td>
                    <td class="text-center">
                        {{ $detail->counter_cetak ? number_format($detail->counter_cetak, 0, ',', '.') : '-' }}
                    </td>
                    <td>
                        <div style="font-size: 7.5px;">
                            Head: <strong>{{ ucfirst($detail->kondisi_print_head ?: 'Normal') }}</strong> | 
                            Tinta: <strong>{{ ucfirst($detail->kondisi_tinta_ribbon ?: 'Cukup') }}</strong> | 
                            Roller: <strong>{{ ucfirst($detail->kondisi_roller_mekanikal ?: 'Normal') }}</strong>
                        </div>
                        @if($detail->catatan)
                            <div style="font-size: 7px; color: #b91c1c; margin-top: 1px;"><em>Catatan: {{ $detail->catatan }}</em></div>
                        @endif
                    </td>
                    <td>
                        {{ $detail->tindakan ?: 'Pengecekan Rutin' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 10px;">Tidak ada unit printer yang dicatat pada kunjungan ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Ringkasan Hasil Pengecekan -->
    <table class="summary-box">
        <tr>
            <td style="width: 25%;">Total Unit: <strong>{{ $kunjungan->details->count() }} Unit</strong></td>
            <td style="width: 25%; color: #15803d;">Kondisi Baik: <strong>{{ $cntBaik }} Unit</strong></td>
            <td style="width: 25%; color: #a16207;">Perlu Perbaikan: <strong>{{ $cntPerlu }} Unit</strong></td>
            <td style="width: 25%; color: #b91c1c;">Rusak / Diganti: <strong>{{ $cntRusak }} Unit</strong></td>
        </tr>
    </table>

    @if($kunjungan->catatan)
        <div class="section-header">Catatan / Rekomendasi Umum Teknisi</div>
        <div class="catatan-box">
            {{ $kunjungan->catatan }}
        </div>
    @endif

    <!-- Kolom Tanda Tangan -->
    <table class="signature-table">
        <tr>
            <td>
                <div>Pelaksana / Teknisi Maintenance,</div>
                <div class="signature-space"></div>
                <div class="signature-name">{{ $kunjungan->nama_teknisi }}</div>
                <div class="meta-sub">PT. INTIWIJAYA KUSUMA</div>
            </td>
            <td>
                <div>Mengetahui / Perwakilan Pelanggan,</div>
                <div class="signature-space"></div>
                <div class="signature-name">{{ $kunjungan->pic_lokasi ?: '(..................................................)' }}</div>
                <div class="meta-sub">{{ strtoupper($kunjungan->lokasi->nama) }}</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dokumen {{ $kunjungan->nomor_kunjungan }} · Dicetak pada {{ $tanggalCetak }} · Sistem Manajemen Inventaris
    </div>
</body>
</html>
