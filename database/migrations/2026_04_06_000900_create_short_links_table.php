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
        Schema::create('short_links', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('users_uid')->constrained('users')->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('slug')->unique();
            $table->string('target_url');
            $table->boolean('is_private')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['users_uid', 'created_at']);
            $table->index(['is_active', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('short_links');
    }
};
