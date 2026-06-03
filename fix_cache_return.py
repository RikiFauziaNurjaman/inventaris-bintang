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
    "app/Http/Controllers/Laporan/LaporanBarangMasukController.php",
    "app/Http/Controllers/Laporan/LaporanBarangKeluarController.php",
    "app/Http/Controllers/Laporan/LaporanBarangKembaliController.php",
    "app/Http/Controllers/MasterData/DataBarangController.php",
    "app/Http/Controllers/MasterData/KategoriBarangController.php",
    "app/Http/Controllers/MasterData/MerekBarangController.php",
]

for file_path in controllers:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r') as f:
        content = f.read()
    
    if 'Cache::remember' not in content:
        print(f"  SKIP (no cache): {file_path}")
        continue

    # Check: does Cache::remember closure have "return Inertia::render" inside?
    # That's the pattern where the return is already correct.
    # The BAD pattern is: closure assigns to $data but doesn't return it.
    
    # Find the pattern: return Inertia::render('...', $data);
    # preceded by }); which closes Cache::remember
    # The bug: inside the closure, last statement before }); is NOT a return
    
    # Let's look for the specific pattern of $data = [...]; at the end of the closure
    # Pattern: "$data = [\n...\n];\n        });"  (no return before it)
    
    # Simple approach: find lines that have "$data = [" followed eventually by "]);"
    # and replace "$data = [" with "return ["
    
    lines = content.split('\n')
    changed = False
    in_cache_closure = False
    brace_depth = 0
    
    for i, line in enumerate(lines):
        if 'Cache::remember' in line and 'function' in line:
            in_cache_closure = True
            brace_depth = 0
        
        if in_cache_closure:
            brace_depth += line.count('{') - line.count('}')
            
            # Check if this line has "$data = [" inside the closure
            stripped = line.strip()
            if stripped.startswith('$data = [') and brace_depth > 0:
                lines[i] = line.replace('$data = [', 'return [')
                changed = True
                print(f"  FIXED: {file_path} line {i+1}: {stripped[:50]}")
            
            if brace_depth <= 0:
                in_cache_closure = False
    
    if changed:
        with open(file_path, 'w') as f:
            f.write('\n'.join(lines))
    else:
        # Check if return already exists (no fix needed)
        print(f"  OK (already correct or different pattern): {file_path}")

