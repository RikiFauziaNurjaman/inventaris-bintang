<?php

namespace App\Helpers;

use App\Models\Barang;
use App\Models\Lokasi;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class MaintenanceNotificationHelper
{
    const CACHE_KEY = 'maintenance_notifications_data';

    /**
     * Ambil data notifikasi jadwal maintenance berkala (dengan caching 3 menit)
     */
    public static function getNotifications(): array
    {
        return Cache::remember(self::CACHE_KEY, 180, function () {
            $today = Carbon::today();

            $lokasiPelanggan = Lokasi::where('is_gudang', false)
                ->whereHas('barang', fn ($q) => $q->where('status', 'dipinjamkan'))
                ->withCount(['barang as total_printer' => fn ($q) => $q->where('status', 'dipinjamkan')])
                ->with([
                    'kunjunganMaintenance' => function ($q) {
                        $q->orderByDesc('tanggal_kunjungan')->orderByDesc('id');
                    }
                ])
                ->get();

            $items = [];
            $overdueCount = 0;
            $dueSoonCount = 0;

            foreach ($lokasiPelanggan as $lokasi) {
                $last = $lokasi->kunjunganMaintenance->first();
                $jadwal = $last?->jadwal_berikutnya;
                $periode = $last?->periode_bulan ?? 3;

                if (!$jadwal) {
                    $firstBarang = Barang::where('lokasi_id', $lokasi->id)->orderBy('created_at')->first();
                    $tanggalAwal = $firstBarang ? Carbon::parse($firstBarang->created_at) : $today;
                    $jadwalDate = $tanggalAwal->copy()->addMonths($periode);
                } else {
                    $jadwalDate = Carbon::parse($jadwal);
                }

                $diffInDays = (int) $today->diffInDays($jadwalDate, false);

                if ($diffInDays < 0) {
                    // 🔴 Overdue (Sudah lewat jadwal)
                    $overdueCount++;
                    $items[] = [
                        'lokasi_id' => $lokasi->id,
                        'lokasi_nama' => $lokasi->nama,
                        'total_printer' => $lokasi->total_printer,
                        'type' => 'overdue',
                        'diff_in_days' => abs($diffInDays),
                        'jadwal_berikutnya' => $jadwalDate->format('Y-m-d'),
                        'kunjungan_terakhir' => $last?->tanggal_kunjungan ? Carbon::parse($last->tanggal_kunjungan)->format('Y-m-d') : null,
                        'title' => 'Jatuh Tempo: ' . $lokasi->nama,
                        'message' => "Sudah lewat " . abs($diffInDays) . " hari dari siklus kunjungan {$periode} bulan ({$lokasi->total_printer} unit printer).",
                    ];
                } elseif ($diffInDays <= 30) {
                    // 🟡 Due Soon (Segera jatuh tempo dalam 30 hari)
                    $dueSoonCount++;
                    $items[] = [
                        'lokasi_id' => $lokasi->id,
                        'lokasi_nama' => $lokasi->nama,
                        'total_printer' => $lokasi->total_printer,
                        'type' => 'due_soon',
                        'diff_in_days' => $diffInDays,
                        'jadwal_berikutnya' => $jadwalDate->format('Y-m-d'),
                        'kunjungan_terakhir' => $last?->tanggal_kunjungan ? Carbon::parse($last->tanggal_kunjungan)->format('Y-m-d') : null,
                        'title' => 'Mendekati Jadwal: ' . $lokasi->nama,
                        'message' => "Jatuh tempo dalam {$diffInDays} hari ({$lokasi->total_printer} unit printer).",
                    ];
                }
            }

            // Urutkan: yang paling overdue berada di atas
            usort($items, function ($a, $b) {
                if ($a['type'] === 'overdue' && $b['type'] !== 'overdue') return -1;
                if ($a['type'] !== 'overdue' && $b['type'] === 'overdue') return 1;
                if ($a['type'] === 'overdue') {
                    return $b['diff_in_days'] <=> $a['diff_in_days']; // Yang paling lama lewat di atas
                }
                return $a['diff_in_days'] <=> $b['diff_in_days']; // Yang paling dekat di atas
            });

            return [
                'unread_count' => $overdueCount + $dueSoonCount,
                'overdue_count' => $overdueCount,
                'due_soon_count' => $dueSoonCount,
                'items' => array_slice($items, 0, 15), // Batasi 15 item teratas untuk popover
            ];
        });
    }

    /**
     * Hapus cache notifikasi (misal setelah catat/edit kunjungan)
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
