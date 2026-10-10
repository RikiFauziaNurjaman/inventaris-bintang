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
        if (!Schema::hasColumn('rekap_stok_barang', 'jumlah_terjual')) {
            Schema::table('rekap_stok_barang', function (Blueprint $table) {
                $table->integer('jumlah_terjual')->default(0);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('rekap_stok_barang', 'jumlah_terjual')) {
            Schema::table('rekap_stok_barang', function (Blueprint $table) {
                $table->dropColumn('jumlah_terjual');
            });
        }
    }
};
