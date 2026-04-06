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
        Schema::create('short_link_clicks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('short_link_id')->constrained('short_links')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('agent')->nullable();
            $table->timestamps();

            $table->index(['short_link_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('short_link_clicks');
    }
};
