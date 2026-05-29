import re
import os

controllers = [
    "app/Http/Controllers/Transaksi/BarangMasukController.php",
    "app/Http/Controllers/Transaksi/BarangKeluarController.php",
    "app/Http/Controllers/Transaksi/BarangKembaliController.php",
    "app/Http/Controllers/Stock/Gudang/StokGudangController.php",
    "app/Http/Controllers/Stock/Distribusi/StokDistribusiController.php",
    "app/Http/Controllers/MonitoringController.php",
    "app/Http/Controllers/Laporan/LaporanSummaryController.php",
    "app/Http/Controllers/MasterData/DataBarangController.php"
]

for file_path in controllers:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Replace Cache::remember($cacheKey, 60, with Cache::remember($cacheKey, 3600,
    new_content = re.sub(r'Cache::remember\(\$cacheKey, 60,', r'Cache::remember($cacheKey, 3600,', content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated TTL to 3600 in {file_path}")
    else:
        print(f"No changes needed for {file_path}")

