<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'username',
    'email',
    'password',
    'is_admin',
    'verified',
    'bio',
    'profile_photo_path',
    'banner_photo_path',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if (is_string($user->username) && trim($user->username) !== '') {
                return;
            }

            $seed = $user->name !== ''
                ? $user->name
                : Str::before((string) $user->email, '@');

            $user->username = self::generateUniqueUsername($seed);
        });
    }

    public static function generateUniqueUsername(string $seed, ?int $ignoreUserId = null): string
    {
        $baseUsername = Str::slug($seed);
        $baseUsername = $baseUsername === '' ? 'creator' : $baseUsername;

        $username = $baseUsername;
        $counter = 2;

        while (
            self::query()
                ->where('username', $username)
                ->when($ignoreUserId !== null, function ($query) use ($ignoreUserId): void {
                    $query->whereKeyNot($ignoreUserId);
                })
                ->exists()
        ) {
            $username = "{$baseUsername}-{$counter}";
            $counter++;
        }

        return $username;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'verified' => 'boolean',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function twibones(): HasMany
    {
        return $this->hasMany(Twibone::class, 'users_uid');
    }
}
