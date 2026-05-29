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
        
    if "Cache::remember" in content:
        print(f"Already cached: {file_path}")
        continue

    # Find the start of index method
    # public function index(Request $request)
    # {
    # ...
    # return Inertia::render('...', [...]);
    # }
    
    match = re.search(r'(public function index\([^)]*\)\s*\{)(.*?)(return Inertia::render\([^;]+;)', content, re.DOTALL)
    if not match:
        print(f"Failed to match index method in {file_path}")
        continue
        
    prefix = match.group(1)
    body = match.group(2)
    return_stmt = match.group(3)
    
    # We will extract the array being passed to Inertia::render
    # return Inertia::render('Path', [ ... ]);
    # We want to replace the body + return_stmt with:
    # $cacheKey = 'cache_' . md5(json_encode($request->all()));
    # $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($request) {
    #     <body>
    #     return <the_array>;
    # });
    # return Inertia::render('Path', $data);
    
    # Extract the array from return Inertia::render('Path', array)
    inertia_match = re.search(r"return Inertia::render\(\s*['\"][^'\"]+['\"]\s*,\s*(.*?)\s*\)\s*;", return_stmt, re.DOTALL)
    if not inertia_match:
        print(f"Failed to match Inertia array in {file_path}")
        continue
        
    inertia_array = inertia_match.group(1)
    inertia_path_match = re.search(r"return Inertia::render\(\s*(['\"][^'\"]+['\"])", return_stmt)
    inertia_path = inertia_path_match.group(1)
    
    new_body = f"""
        $cacheKey = '{os.path.basename(file_path).replace('.php', '')}_' . md5(json_encode(request()->all()));
        $data = \\Illuminate\\Support\\Facades\\Cache::remember($cacheKey, 60, function () use ($request) {{
{body}
            return {inertia_array};
        }});

        return Inertia::render({inertia_path}, $data);"""
        
    new_content = content[:match.start()] + prefix + new_body + content[match.end():]
    
    with open(file_path, 'w') as f:
        f.write(new_content)
        
    print(f"Patched {file_path}")

