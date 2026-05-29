import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Metrik custom ─────────────────────────────────────────────────────────────
const rtDashboard       = new Trend('rt_dashboard');
const rtDaftarBarang    = new Trend('rt_daftar_barang');
const rtDetailBarang    = new Trend('rt_detail_barang');
const rtBarangMasuk     = new Trend('rt_barang_masuk');
const rtBarangKeluar    = new Trend('rt_barang_keluar');
const rtBarangKembali   = new Trend('rt_barang_kembali');
const rtStokGudang      = new Trend('rt_stok_gudang');
const rtStokDistribusi  = new Trend('rt_stok_distribusi');
const rtMonitoring      = new Trend('rt_monitoring');
const rtLaporan         = new Trend('rt_laporan');
const errorRate         = new Rate('error_rate');
const totalRequests     = new Counter('total_requests');

// ─── Konfigurasi skenario ──────────────────────────────────────────────────────
// Untuk pengujian 100 request  → target: 5,  duration: '40s'
// Untuk pengujian 500 request  → target: 10, duration: '3m'
// Untuk pengujian 1000 request → target: 10, duration: '6m'
// Ganti nilai di bawah sesuai skenario yang sedang diuji

export const options = {
  scenarios: {
    inventaris_load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // ramp-up
        { duration: '2m',  target: 10 },  // tahan beban
        { duration: '20s', target: 0  },  // ramp-down
      ],
    },
  },

  thresholds: {
    http_req_duration:     ['p(95)<3000'],   // 95% request < 3 detik
    http_req_failed:       ['rate<0.05'],     // error < 5%
    rt_dashboard:          ['avg<2000'],      // dashboard < 2 detik
    rt_daftar_barang:      ['avg<2000'],      // daftar barang < 2 detik
    rt_detail_barang:      ['avg<1500'],      // detail barang < 1.5 detik
    rt_barang_masuk:       ['avg<2000'],      // barang masuk < 2 detik
    rt_barang_keluar:      ['avg<2000'],      // barang keluar < 2 detik
    rt_barang_kembali:     ['avg<2000'],      // barang kembali < 2 detik
    rt_stok_gudang:        ['avg<1500'],      // stok gudang < 1.5 detik
    rt_stok_distribusi:    ['avg<1500'],      // stok distribusi < 1.5 detik
    rt_monitoring:         ['avg<2000'],      // monitoring < 2 detik
    rt_laporan:            ['avg<2000'],      // laporan < 2 detik
  },
};

// ─── Konfigurasi aplikasi ──────────────────────────────────────────────────────
const BASE_URL  = 'http://localhost:8000';
const LOGIN_URL = `${BASE_URL}/login`;
const NAME      = 'admin';               // login menggunakan field 'name'
const PASSWORD  = '123';

// ID barang yang ada di database — isi dengan ID yang valid
const BARANG_IDS        = [1, 2, 3, 4, 5];

// ID transaksi barang masuk yang ada di database
const BARANG_MASUK_IDS  = [1, 2, 3, 4, 5];

// ID transaksi barang keluar yang ada di database
const BARANG_KELUAR_IDS = [1, 2, 3, 4, 5];

// ID transaksi barang kembali yang ada di database
const BARANG_KEMBALI_IDS = [1, 2, 3, 4, 5];

// ─── Path URL — sesuai route Laravel di web.php ────────────────────────────────
const PATH = {
  dashboard:      '/dashboard',
  barang:         '/barang',             // daftar semua barang (DataBarangController)
  detailBarang:   '/barang',             // detail barang: /barang/{id}
  barangMasuk:    '/barang-masuk',       // transaksi barang masuk
  barangKeluar:   '/barang-keluar',      // transaksi barang keluar
  barangKembali:  '/barang-kembali',     // transaksi barang kembali
  stokGudang:     '/stok-gudang',        // stok di gudang
  stokDistribusi: '/stok-distribusi',    // stok distribusi ke lokasi
  monitoring:     '/monitoring',         // monitoring status barang per lokasi
  laporan:        '/laporan',            // halaman utama laporan
  laporanMasuk:   '/laporan/masuk',      // laporan barang masuk
  laporanKeluar:  '/laporan/keluar',     // laporan barang keluar
  laporanKembali: '/laporan/kembali',    // laporan barang kembali
  kategori:       '/kategori',           // master data kategori
  merek:          '/merek',              // master data merek
};

// ─── Setup: login via backdoor (GET) ───────────────────────────────────────────
// Dihapus karena jika menggunakan shared cookie di setup(), Laravel akan mengalami
// session lock contention (karena 5 VU memakai 1 session ID yang sama).

// ─── Helper: header untuk Inertia.js requests ────────────────────────────────
const inertiaHeaders = {
  'Accept':            'text/html, application/xhtml+xml',
  'X-Inertia':         'true',
  'X-Requested-With':  'XMLHttpRequest',
};

// ─── Skenario utama ───────────────────────────────────────────────────────────
export default function () {
  // ── 1. Dashboard ──────────────────────────────────────────────────────────
  // Query berat: agregasi stok summary, stok per lokasi, aktivitas terakhir,
  // stok kritis, stok baru/second, total kategori & jenis barang
  group('1. Dashboard', function () {
    const res = http.get(`${BASE_URL}${PATH.dashboard}`, { headers: inertiaHeaders });

    check(res, {
      'dashboard: status 200':        (r) => r.status === 200,
      'dashboard: response < 3000ms': (r) => r.timings.duration < 3000,
    });

    rtDashboard.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 2. Daftar Barang (Master Data) ────────────────────────────────────────
  // Query: semua barang + relasi model, merek, kategori, lokasi, rak
  group('2. Daftar Barang', function () {
    const res = http.get(`${BASE_URL}${PATH.barang}`, { headers: inertiaHeaders });

    check(res, {
      'daftar barang: status 200':        (r) => r.status === 200,
      'daftar barang: response < 2000ms': (r) => r.timings.duration < 2000,
    });

    rtDaftarBarang.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 3. Detail Barang ────────────────────────────────────────────────────────
  // Mengambil detail barang yang valid (ID yang ada di database)
  group('3. Detail Barang', function () {
    const validIds = [159, 160, 161, 162, 87];
    for (let i = 0; i < validIds.length; i++) {
      const id = validIds[i];
      const resDetail = http.get(`${BASE_URL}/dashboard/barang-detail/${id}`, { headers: inertiaHeaders });
      check(resDetail, { 'detail_barang: status 200': (r) => r.status === 200 });
      rtDetailBarang.add(resDetail.timings.duration);
      errorRate.add(resDetail.status !== 200);
      totalRequests.add(1);
      sleep(0.5);
    }
  });

  // ── 4. Transaksi Barang Masuk ─────────────────────────────────────────────
  // Query: daftar transaksi barang masuk + join asal barang + detail items
  group('4. Barang Masuk', function () {
    const res = http.get(`${BASE_URL}${PATH.barangMasuk}`, { headers: inertiaHeaders });

    check(res, {
      'barang masuk: status 200':        (r) => r.status === 200,
      'barang masuk: response < 2500ms': (r) => r.timings.duration < 2500,
    });

    rtBarangMasuk.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 5. Transaksi Barang Keluar ────────────────────────────────────────────
  // Query: daftar transaksi barang keluar + join lokasi + detail items
  group('5. Barang Keluar', function () {
    const res = http.get(`${BASE_URL}${PATH.barangKeluar}`, { headers: inertiaHeaders });

    check(res, {
      'barang keluar: status 200':        (r) => r.status === 200,
      'barang keluar: response < 2500ms': (r) => r.timings.duration < 2500,
    });

    rtBarangKeluar.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 6. Transaksi Barang Kembali ───────────────────────────────────────────
  // Query: daftar transaksi barang kembali + join lokasi + detail items
  group('6. Barang Kembali', function () {
    const res = http.get(`${BASE_URL}${PATH.barangKembali}`, { headers: inertiaHeaders });

    check(res, {
      'barang kembali: status 200':        (r) => r.status === 200,
      'barang kembali: response < 2500ms': (r) => r.timings.duration < 2500,
    });

    rtBarangKembali.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 7. Stok Gudang ────────────────────────────────────────────────────────
  // Query: rekap stok per model barang di gudang + join model/merek/kategori
  group('7. Stok Gudang', function () {
    const res = http.get(`${BASE_URL}${PATH.stokGudang}`, { headers: inertiaHeaders });

    check(res, {
      'stok gudang: status 200':        (r) => r.status === 200,
      'stok gudang: response < 2000ms': (r) => r.timings.duration < 2000,
    });

    rtStokGudang.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 8. Stok Distribusi ────────────────────────────────────────────────────
  // Query: stok per lokasi distribusi + join model/merek + group by lokasi
  group('8. Stok Distribusi', function () {
    const res = http.get(`${BASE_URL}${PATH.stokDistribusi}`, { headers: inertiaHeaders });

    check(res, {
      'stok distribusi: status 200':        (r) => r.status === 200,
      'stok distribusi: response < 2000ms': (r) => r.timings.duration < 2000,
    });

    rtStokDistribusi.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 9. Monitoring ─────────────────────────────────────────────────────────
  // Query: status barang per lokasi + agregasi kondisi + jumlah per kategori
  group('9. Monitoring', function () {
    const res = http.get(`${BASE_URL}${PATH.monitoring}`, { headers: inertiaHeaders });

    check(res, {
      'monitoring: status 200':        (r) => r.status === 200,
      'monitoring: response < 2500ms': (r) => r.timings.duration < 2500,
    });

    rtMonitoring.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  // ── 10. Laporan Summary ───────────────────────────────────────────────────
  // Query: ringkasan laporan semua transaksi + statistik
  group('10. Laporan', function () {
    const res = http.get(`${BASE_URL}${PATH.laporan}`, { headers: inertiaHeaders });

    check(res, {
      'laporan: status 200':        (r) => r.status === 200,
      'laporan: response < 2500ms': (r) => r.timings.duration < 2500,
    });

    rtLaporan.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    totalRequests.add(1);
    sleep(1);
  });

  sleep(0.5);
}

// ─── Teardown ─────────────────────────────────────────────────────────────────
export function teardown() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PENGUJIAN SELESAI — Aplikasi Inventaris Bintang');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Metrik custom yang tercatat:');
  console.log('  rt_dashboard        → Response time halaman Dashboard');
  console.log('  rt_daftar_barang    → Response time halaman Daftar Barang');
  console.log('  rt_detail_barang    → Response time halaman Detail Barang');
  console.log('  rt_barang_masuk     → Response time halaman Barang Masuk');
  console.log('  rt_barang_keluar    → Response time halaman Barang Keluar');
  console.log('  rt_barang_kembali   → Response time halaman Barang Kembali');
  console.log('  rt_stok_gudang      → Response time halaman Stok Gudang');
  console.log('  rt_stok_distribusi  → Response time halaman Stok Distribusi');
  console.log('  rt_monitoring       → Response time halaman Monitoring');
  console.log('  rt_laporan          → Response time halaman Laporan');
  console.log('');
  console.log('Salin nilai avg dari output di atas ke tabel perbandingan jurnal.');
  console.log('Bandingkan hasil TANPA Redis (CACHE_STORE=database)');
  console.log('dengan DENGAN Redis (CACHE_STORE=redis) di .env');
  console.log('═══════════════════════════════════════════════════════════════');
}
