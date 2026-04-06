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
        Schema::table('twibone', function (Blueprint $table): void {
            $table->string('custom_url')->nullable()->unique()->after('url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('twibone', function (Blueprint $table): void {
            $table->dropUnique('twibone_custom_url_unique');
            $table->dropColumn('custom_url');
        });
    }
};
