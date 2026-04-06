<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 40)->nullable()->after('name');
        });

        $usedUsernames = [];

        DB::table('users')
            ->select(['id', 'name', 'email'])
            ->orderBy('id')
            ->get()
            ->each(function (object $user) use (&$usedUsernames): void {
                $seed = trim((string) $user->name) !== ''
                    ? (string) $user->name
                    : Str::before((string) $user->email, '@');

                $baseUsername = Str::slug($seed);
                $baseUsername = $baseUsername === '' ? 'creator' : $baseUsername;

                $username = $baseUsername;
                $counter = 2;

                while (in_array($username, $usedUsernames, true)) {
                    $username = "{$baseUsername}-{$counter}";
                    $counter++;
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'username' => $username,
                    ]);

                $usedUsernames[] = $username;
            });

        Schema::table('users', function (Blueprint $table): void {
            $table->unique('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
