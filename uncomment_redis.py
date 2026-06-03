import os
import re

controllers = [
    "app/Http/Controllers/Dashboard/DashboardController.php",
    "app/Http/Controllers/Transaksi/BarangMasukController.php",
    "app/Http/Controllers/Transaksi/BarangKeluarController.php",
    "app/Http/Controllers/Transaksi/BarangKembaliController.php",
    "app/Http/Controllers/Stock/Gudang/StokGudangController.php",
    "app/Http/Controllers/Stock/Distribusi/StokDistribusiController.php",
    "app/Http/Controllers/MonitoringController.php",
    "app/Http/Controllers/Laporan/LaporanSummaryController.php",
    "app/Http/Controllers/Laporan/LaporanBarangMasukController.php",
    "app/Http/Controllers/Laporan/LaporanBarangKeluarController.php",
    "app/Http/Controllers/Laporan/LaporanBarangKembaliController.php",
    "app/Http/Controllers/MasterData/DataBarangController.php",
    "app/Http/Controllers/MasterData/KategoriBarangController.php",
    "app/Http/Controllers/MasterData/MerekBarangController.php",
]

count = 0
for file_path in controllers:
    if not os.path.exists(file_path):
        print(f"  SKIP (not found): {file_path}")
        continue

    with open(file_path, 'r') as f:
        content = f.read()

    if '// [REDIS]' not in content:
        print(f"  SKIP (no [REDIS] tags): {file_path}")
        continue

    # Uncomment lines: remove the "// [REDIS] " prefix, keeping the actual code
    new_content = re.sub(r'^(\s*)// \[REDIS\] (.*)$', r'\1\2', content, flags=re.MULTILINE)

    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        count += 1
        print(f"  OK: {file_path}")
    else:
        print(f"  NO CHANGE: {file_path}")

print(f"\nDone. Uncommented [REDIS] tags in {count} files.")
