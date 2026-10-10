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
        if (!Schema::hasColumn('barang', 'rak_id')) {
            Schema::table('barang', function (Blueprint $table) {
                $table->foreignId('rak_id')->nullable()->constrained('rak_barang');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('barang', 'rak_id')) {
            Schema::table('barang', function (Blueprint $table) {
                $table->dropForeign(['rak_id']);
                $table->dropColumn('rak_id');
            });
        }
    }
};
