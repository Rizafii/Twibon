<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed a single admin account.
     */
    public function run(): void
    {
        $adminEmail = 'rizafidev@gmail.com';
        $adminName = 'Administrator';
        $adminPassword = '123123123';
        $preferredUsername = 'rizafi';

        $existingAdmin = User::query()
            ->where('email', $adminEmail)
            ->first();

        $username = User::generateUniqueUsername(
            $preferredUsername !== '' ? $preferredUsername : 'admin',
            $existingAdmin?->id,
        );

        User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'username' => $username,
                'password' => Hash::make($adminPassword),
                'email_verified_at' => now(),
                'verified' => true,
                'is_admin' => true,
            ],
        );
    }
}
