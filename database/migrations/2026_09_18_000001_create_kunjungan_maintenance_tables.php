<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kunjungan_maintenance', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kunjungan')->unique();
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nama_teknisi');
            $table->date('tanggal_kunjungan');
            $table->integer('periode_bulan')->default(3); // Interval dalam bulan (misal 3 atau 6)
            $table->date('jadwal_berikutnya')->nullable();
            $table->string('status')->default('selesai'); // terjadwal, selesai, dibatalkan
            $table->string('pic_lokasi')->nullable();
            $table->string('kontak_pic')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('kunjungan_maintenance_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->constrained('kunjungan_maintenance')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->foreignId('sub_lokasi_id')->nullable()->constrained('sub_lokasi')->onDelete('set null');
            $table->string('kondisi_sebelumnya')->nullable();
            $table->string('kondisi_fisik')->default('baik'); // baik, perlu_perbaikan, rusak
            $table->string('status_operasional')->default('normal'); // normal, gangguan_ringan, rusak_total
            $table->integer('counter_cetak')->nullable();
            $table->string('kondisi_print_head')->nullable(); // bagus, bergaris, pudar, macet
            $table->string('kondisi_tinta_ribbon')->nullable(); // cukup, menipis, habis, diganti_baru
            $table->string('kondisi_roller_mekanikal')->nullable(); // normal, kotor, aus
            $table->string('tindakan')->nullable(); // Pembersihan, Ganti Part, Kalibrasi, dll.
            $table->text('catatan')->nullable();
            $table->boolean('sync_status_barang')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan_maintenance_detail');
        Schema::dropIfExists('kunjungan_maintenance');
    }
};
