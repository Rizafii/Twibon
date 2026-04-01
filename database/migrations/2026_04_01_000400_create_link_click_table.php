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
        Schema::create('link_click', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('link_uid')->constrained('link')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('agent')->nullable();
            $table->timestamps();

            $table->index(['link_uid', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_click');
    }
};
