<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_opname', function (Blueprint $table) {
            $table->string('status')->default('active')->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedTinyInteger('workflow_version')->default(2);
        });

        DB::table('stock_opname')->orderBy('id')->each(function ($opname) {
            DB::table('stock_opname')->where('id', $opname->id)->update([
                'status' => $opname->approved_at ? 'approved' : 'submitted',
                'started_at' => $opname->created_at,
                'submitted_at' => $opname->approved_at ?: $opname->created_at,
                'workflow_version' => 1,
            ]);
        });

        Schema::create('stock_opname_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained('stock_opname')->cascadeOnDelete();
            $table->foreignId('barang_id')->nullable()->constrained('barang')->nullOnDelete();
            $table->foreignId('model_id')->nullable()->constrained('model_barang')->nullOnDelete();
            $table->string('serial_number');
            $table->string('normalized_serial');
            $table->string('state')->default('pending');
            $table->string('status_snapshot')->nullable();
            $table->foreignId('scanned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();

            $table->unique(['stock_opname_id', 'normalized_serial']);
            $table->index(['stock_opname_id', 'state']);
            $table->index(['stock_opname_id', 'scanned_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opname_item');

        Schema::table('stock_opname', function (Blueprint $table) {
            $table->dropColumn(['status', 'started_at', 'submitted_at', 'workflow_version']);
        });
    }
};
