<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

class DatabaseController extends Controller
{
    /**
     * Display the database management page.
     */
    public function index()
    {
        $backups = $this->getBackupFiles();

        return Inertia::render('settings/database', [
            'backups' => $backups,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Create a new database backup using pg_dump.
     */
    public function backup()
    {
        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUser = config('database.connections.pgsql.username');
        $dbPass = config('database.connections.pgsql.password');

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';

        // Ensure the backups directory exists
        $backupDir = storage_path('app/backups');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $filePath = $backupDir . DIRECTORY_SEPARATOR . $filename;

        // Build the pg_dump command
        $command = [
            'pg_dump',
            '--host=' . $dbHost,
            '--port=' . $dbPort,
            '--username=' . $dbUser,
            '--no-password',
            '--format=plain',
            '--file=' . $filePath,
            $dbName,
        ];

        $process = new Process($command);
        $process->setEnv(['PGPASSWORD' => $dbPass]);
        $process->setTimeout(300); // 5 minutes timeout

        try {
            $process->mustRun();
        } catch (\Symfony\Component\Process\Exception\ProcessFailedException $e) {
            return redirect()->route('database.index')->with('error', 'Backup gagal: ' . $e->getMessage());
        }

        return redirect()->route('database.index')->with('success', 'Backup berhasil dibuat: ' . $filename);
    }

    /**
     * Import (restore) a database from an uploaded .sql file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'sql_file' => 'required|file|max:512000', // max 500MB
        ]);

        $file = $request->file('sql_file');

        // Validate file extension
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension !== 'sql') {
            return redirect()->route('database.index')->with('error', 'File harus berformat .sql');
        }

        $dbHost = config('database.connections.pgsql.host');
        $dbPort = config('database.connections.pgsql.port');
        $dbName = config('database.connections.pgsql.database');
        $dbUser = config('database.connections.pgsql.username');
        $dbPass = config('database.connections.pgsql.password');

        // Store the uploaded file temporarily
        $tempPath = $file->storeAs('temp', 'import_' . time() . '.sql');
        $fullTempPath = storage_path('app/' . $tempPath);

        // Build the psql command
        $command = [
            'psql',
            '--host=' . $dbHost,
            '--port=' . $dbPort,
            '--username=' . $dbUser,
            '--no-password',
            '--dbname=' . $dbName,
            '--file=' . $fullTempPath,
        ];

        $process = new Process($command);
        $process->setEnv(['PGPASSWORD' => $dbPass]);
        $process->setTimeout(600); // 10 minutes timeout

        try {
            $process->mustRun();
        } catch (\Symfony\Component\Process\Exception\ProcessFailedException $e) {
            // Clean up temp file
            @unlink($fullTempPath);
            return redirect()->route('database.index')->with('error', 'Import gagal: ' . $e->getMessage());
        }

        // Clean up temp file
        @unlink($fullTempPath);

        return redirect()->route('database.index')->with('success', 'Database berhasil diimport.');
    }

    /**
     * Download a backup file.
     */
    public function download(string $filename)
    {
        $filePath = storage_path('app/backups/' . $filename);

        if (!file_exists($filePath)) {
            return redirect()->route('database.index')->with('error', 'File backup tidak ditemukan.');
        }

        return response()->download($filePath);
    }

    /**
     * Delete a backup file.
     */
    public function destroy(string $filename)
    {
        $filePath = storage_path('app/backups/' . $filename);

        if (!file_exists($filePath)) {
            return redirect()->route('database.index')->with('error', 'File backup tidak ditemukan.');
        }

        @unlink($filePath);

        return redirect()->route('database.index')->with('success', 'File backup berhasil dihapus.');
    }

    /**
     * Get list of backup files with metadata.
     */
    private function getBackupFiles(): array
    {
        $backupDir = storage_path('app/backups');

        if (!is_dir($backupDir)) {
            return [];
        }

        $files = glob($backupDir . DIRECTORY_SEPARATOR . '*.sql');
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => $this->formatFileSize(filesize($file)),
                'size_bytes' => filesize($file),
                'date' => date('d M Y H:i:s', filemtime($file)),
                'timestamp' => filemtime($file),
            ];
        }

        // Sort by timestamp descending (newest first)
        usort($backups, fn($a, $b) => $b['timestamp'] - $a['timestamp']);

        return $backups;
    }

    /**
     * Format file size to human readable format.
     */
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
