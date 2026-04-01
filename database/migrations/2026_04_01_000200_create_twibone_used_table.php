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
        Schema::create('twibone_used', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('twibone_uid')->constrained('twibone')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('agent')->nullable();
            $table->timestamps();

            $table->index(['twibone_uid', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('twibone_used');
    }
};
