<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\BarangKembali;
use App\Models\BarangMasuk;
use App\Models\KategoriBarang;
use App\Models\Lokasi;
use App\Models\MerekBarang;
use App\Models\ModelBarang;
use App\Models\RekapStokBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    /**
     * Handle AI chat request.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'array|max:20',
        ]);

        $userMessage = $request->input('message');
        $history = $request->input('history', []);

        try {
            // Kumpulkan konteks data inventaris
            $context = $this->gatherInventoryContext();

            // Bangun pesan untuk AI
            $messages = $this->buildMessages($context, $history, $userMessage);

            // Kirim ke DeepSeek API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.deepseek.api_key'),
                'Content-Type' => 'application/json',
            ])->timeout(30)->post(config('services.deepseek.base_url') . '/chat/completions', [
                'model' => 'deepseek-chat',
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 1024,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiMessage = $data['choices'][0]['message']['content'] ?? 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

                return response()->json([
                    'success' => true,
                    'message' => $aiMessage,
                ]);
            }

            Log::error('DeepSeek API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
            ], 500);

        } catch (\Exception $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
            ], 500);
        }
    }

    /**
     * Dapatkan quick suggestion berdasarkan data aktual.
     */
    public function suggestions()
    {
        $suggestions = [
            'Berapa total stok barang saat ini?',
            'Barang apa saja yang stoknya kritis?',
            'Analisis stok per lokasi distribusi',
            'Rekomendasi restok barang',
            'Ringkasan aktivitas barang masuk bulan ini',
            'Lokasi mana yang memiliki stok paling banyak?',
        ];

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Kumpulkan konteks data inventaris dari database.
     */
    private function gatherInventoryContext(): string
    {
        $context = "=== DATA INVENTARIS REAL-TIME ===\n\n";

        // 1. Ringkasan Stok Gudang
        $stokSummary = RekapStokBarang::selectRaw('
                SUM(jumlah_tersedia) as tersedia,
                SUM(jumlah_rusak) as rusak,
                SUM(jumlah_perbaikan) as perbaikan,
                SUM(jumlah_terjual) as terjual,
                SUM(jumlah_total) as total
            ')
            ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
            ->where('lokasi.is_gudang', true)
            ->first();

        $context .= "RINGKASAN STOK GUDANG:\n";
        $context .= "- Total barang: " . ($stokSummary->total ?? 0) . "\n";
        $context .= "- Tersedia: " . ($stokSummary->tersedia ?? 0) . "\n";
        $context .= "- Rusak: " . ($stokSummary->rusak ?? 0) . "\n";
        $context .= "- Dalam perbaikan: " . ($stokSummary->perbaikan ?? 0) . "\n";
        $context .= "- Terjual: " . ($stokSummary->terjual ?? 0) . "\n\n";

        // 2. Stok Per Lokasi Distribusi
        $stokPerLokasi = RekapStokBarang::select('lokasi_id')
            ->selectRaw('
                SUM(jumlah_tersedia) as tersedia,
                SUM(jumlah_rusak) as rusak,
                SUM(jumlah_perbaikan) as perbaikan,
                SUM(jumlah_total) as total
            ')
            ->join('lokasi', 'rekap_stok_barang.lokasi_id', '=', 'lokasi.id')
            ->where('lokasi.is_gudang', false)
            ->groupBy('lokasi_id')
            ->with('lokasi')
            ->get();

        $context .= "STOK PER LOKASI DISTRIBUSI:\n";
        foreach ($stokPerLokasi as $item) {
            $namaLokasi = $item->lokasi->nama ?? 'Tidak diketahui';
            $context .= "- {$namaLokasi}: Tersedia={$item->tersedia}, Rusak={$item->rusak}, Perbaikan={$item->perbaikan}, Total={$item->total}\n";
        }
        $context .= "\n";

        // 3. Stok Kritis (< 10)
        $stokKritis = RekapStokBarang::where('jumlah_tersedia', '<', 10)
            ->whereHas('lokasi', fn($q) => $q->where('is_gudang', true))
            ->with(['lokasi', 'modelBarang.merek'])
            ->take(15)
            ->get();

        $context .= "STOK KRITIS (tersedia < 10 unit di gudang):\n";
        if ($stokKritis->isEmpty()) {
            $context .= "- Tidak ada stok kritis saat ini.\n";
        } else {
            foreach ($stokKritis as $item) {
                $nama = optional($item->modelBarang?->merek)->nama . ' ' . ($item->modelBarang->nama ?? '-');
                $context .= "- {$nama}: Tersedia={$item->jumlah_tersedia} di {$item->lokasi->nama}\n";
            }
        }
        $context .= "\n";

        // 4. Aktivitas Terakhir
        $latestMasuk = BarangMasuk::with('asal')->latest()->take(5)->get();
        $context .= "5 BARANG MASUK TERAKHIR:\n";
        foreach ($latestMasuk as $item) {
            $context .= "- {$item->tanggal}: Dari " . ($item->asal->nama ?? '-') . "\n";
        }
        $context .= "\n";

        $latestKeluar = BarangKeluar::with('lokasi')->latest()->take(5)->get();
        $context .= "5 BARANG KELUAR TERAKHIR:\n";
        foreach ($latestKeluar as $item) {
            $context .= "- {$item->tanggal}: Ke " . ($item->lokasi->nama ?? '-') . "\n";
        }
        $context .= "\n";

        $latestKembali = BarangKembali::with('lokasi')->latest()->take(5)->get();
        $context .= "5 BARANG KEMBALI TERAKHIR:\n";
        foreach ($latestKembali as $item) {
            $context .= "- {$item->tanggal}: Dari " . ($item->lokasi->nama ?? '-') . "\n";
        }
        $context .= "\n";

        // 5. Statistik Umum
        $totalKategori = KategoriBarang::count();
        $totalMerek = MerekBarang::count();
        $totalModel = ModelBarang::count();
        $totalLokasi = Lokasi::count();
        $totalBarangUnit = Barang::count();

        $context .= "STATISTIK UMUM:\n";
        $context .= "- Total unit barang (per serial number): {$totalBarangUnit}\n";
        $context .= "- Jumlah kategori: {$totalKategori}\n";
        $context .= "- Jumlah merek: {$totalMerek}\n";
        $context .= "- Jumlah model barang: {$totalModel}\n";
        $context .= "- Jumlah lokasi: {$totalLokasi}\n\n";

        // 6. Top Model Barang berdasarkan stok
        $topModels = RekapStokBarang::select('model_id')
            ->selectRaw('SUM(jumlah_total) as total_stok')
            ->with('modelBarang.merek')
            ->groupBy('model_id')
            ->orderByDesc('total_stok')
            ->take(10)
            ->get();

        $context .= "TOP 10 MODEL BARANG (berdasarkan total stok):\n";
        foreach ($topModels as $i => $item) {
            $nama = optional($item->modelBarang?->merek)->nama . ' ' . ($item->modelBarang->nama ?? '-');
            $context .= ($i + 1) . ". {$nama}: {$item->total_stok} unit\n";
        }

        return $context;
    }

    /**
     * Bangun array messages untuk DeepSeek API.
     */
    private function buildMessages(string $context, array $history, string $userMessage): array
    {
        $systemPrompt = <<<PROMPT
Kamu adalah **Asisten AI Inventaris** untuk sistem manajemen inventaris PT. Intiwijaya Kusuma. Kamu bertugas membantu pengguna dalam:

1. **Menjawab pertanyaan tentang inventaris** — Berikan informasi akurat berdasarkan data real-time yang diberikan.
2. **Menganalisis data inventaris** — Buat analisis tren, perbandingan, dan insight dari data stok.
3. **Memberikan rekomendasi pengelolaan stok** — Sarankan restok, redistribusi, atau tindakan perbaikan berdasarkan data.

## Aturan:
- Selalu jawab dalam **Bahasa Indonesia** yang profesional namun ramah.
- Gunakan data konteks yang diberikan untuk menjawab pertanyaan. Jangan mengarang data.
- Jika data tidak cukup untuk menjawab, katakan dengan jujur dan sarankan langkah selanjutnya.
- Format jawaban dengan rapi menggunakan bullet points, numbering, atau bold jika diperlukan.
- Berikan emoji yang relevan untuk membuat jawaban lebih menarik.
- Jika diminta rekomendasi, berikan alasan yang jelas berdasarkan data.
- Jangan pernah menyebutkan bahwa kamu membaca dari "konteks" atau "data yang diberikan". Bersikaplah seolah-olah kamu mengakses sistem secara langsung.

## Data Inventaris Saat Ini:
{$context}
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Tambahkan history percakapan
        foreach ($history as $entry) {
            if (isset($entry['role']) && isset($entry['content'])) {
                $messages[] = [
                    'role' => $entry['role'],
                    'content' => $entry['content'],
                ];
            }
        }

        // Tambahkan pesan user terbaru
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $messages;
    }
}
