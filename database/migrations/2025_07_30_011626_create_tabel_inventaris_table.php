<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kategori_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('merek_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('jenis_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // Contoh: Inkjet, Dot Matrix, Laser
            $table->foreignId('kategori_id')->nullable()->constrained('kategori_barang')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('model_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori_barang')->onDelete('cascade');
            $table->foreignId('merek_id')->constrained('merek_barang')->onDelete('cascade');
            $table->foreignId('jenis_id')->nullable()->constrained('jenis_barang')->onDelete('set null');
            $table->string('deskripsi')->nullable();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('lokasi', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('alamat')->nullable();
            $table->boolean('is_gudang')->default(false);
            $table->timestamps();
        });

        Schema::create('asal_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('rak_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->string('nama_rak');
            $table->string('baris')->nullable();
            $table->string('kode_rak');
            $table->timestamps();
        });

        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('model_barang')->onDelete('cascade');
            $table->foreignId('jenis_barang_id')->constrained('jenis_barang')->onDelete('cascade');
            $table->foreignId('asal_id')->nullable()->constrained('asal_barang')->onDelete('set null');
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi')->onDelete('set null');
            $table->foreignId('rak_id')->nullable()->constrained('rak_barang');
            $table->string('serial_number')->unique();
            $table->enum('kondisi_awal', ['baru', 'second'])->default('baru');
            $table->enum('status', ['baik', 'rusak', 'diperbaiki'])->default('baik');
            $table->timestamps();
        });

        Schema::create('rekap_stok_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('model_barang')->onDelete('cascade');
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->integer('jumlah_total')->default(0);
            $table->integer('jumlah_tersedia')->default(0);
            $table->integer('jumlah_rusak')->default(0);
            $table->integer('jumlah_perbaikan')->default(0);
            $table->integer('jumlah_terdistribusi')->default(0);
            $table->integer('jumlah_terjual')->default(0);
            $table->timestamps();
        });

        Schema::create('barang_masuk', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('asal_barang_id')->nullable()->constrained('asal_barang')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('barang_masuk_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_masuk_id')->constrained('barang_masuk')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
        });

        Schema::create('barang_keluar', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('restrict');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('barang_keluar_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_keluar_id')->constrained('barang_keluar')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->enum('status_keluar', ['dipinjamkan', 'dijual'])->default('dipinjamkan');
        });

        Schema::create('barang_kembali', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('restrict');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('barang_kembali_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_kembali_id')->constrained('barang_kembali')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->enum('kondisi', ['bagus', 'rusak', 'diperbaiki'])->default('bagus');
            $table->string('status_saat_kembali')->nullable();
            $table->string('kondisi_awal_saat_kembali')->nullable();
        });

        Schema::create('mutasi_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->foreignId('lokasi_asal_id')->nullable()->constrained('lokasi')->onDelete('set null');
            $table->foreignId('lokasi_tujuan_id')->nullable()->constrained('lokasi')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->date('tanggal');
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_status_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->date('tanggal');
            $table->enum('status', ['baik', 'rusak', 'diperbaiki']);
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_status_barang');
        Schema::dropIfExists('mutasi_barang');
        Schema::dropIfExists('barang_kembali_detail');
        Schema::dropIfExists('barang_kembali');
        Schema::dropIfExists('barang_keluar_detail');
        Schema::dropIfExists('barang_keluar');
        Schema::dropIfExists('barang_masuk_detail');
        Schema::dropIfExists('barang_masuk');
        Schema::dropIfExists('rekap_stok_barang');
        Schema::dropIfExists('barang');
        Schema::dropIfExists('rak_barang');
        Schema::dropIfExists('asal_barang');
        Schema::dropIfExists('lokasi');
        Schema::dropIfExists('model_barang');
        Schema::dropIfExists('jenis_barang');
        Schema::dropIfExists('merek_barang');
        Schema::dropIfExists('kategori_barang');
    }

};
