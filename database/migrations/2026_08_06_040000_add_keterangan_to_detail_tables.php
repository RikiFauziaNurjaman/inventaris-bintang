<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('barang_masuk_detail', function (Blueprint $table) {
            $table->text('keterangan')->nullable()->after('barang_id');
        });

        Schema::table('barang_keluar_detail', function (Blueprint $table) {
            $table->text('keterangan')->nullable()->after('status_keluar');
        });

        Schema::table('barang_kembali_detail', function (Blueprint $table) {
            $table->text('keterangan')->nullable()->after('kondisi');
        });
    }

    public function down(): void
    {
        Schema::table('barang_masuk_detail', function (Blueprint $table) {
            $table->dropColumn('keterangan');
        });

        Schema::table('barang_keluar_detail', function (Blueprint $table) {
            $table->dropColumn('keterangan');
        });

        Schema::table('barang_kembali_detail', function (Blueprint $table) {
            $table->dropColumn('keterangan');
        });
    }
};
