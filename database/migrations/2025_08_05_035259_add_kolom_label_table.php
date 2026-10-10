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
        if (!Schema::hasColumn('model_barang', 'label')) {
            Schema::table('model_barang', function (Blueprint $table) {
                $table->string('label')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('model_barang', 'label')) {
            Schema::table('model_barang', function (Blueprint $table) {
                $table->dropColumn('label');
            });
        }
    }
};
