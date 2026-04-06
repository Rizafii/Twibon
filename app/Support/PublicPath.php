<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicPath
{
    /**
     * @var array<int, string>
     */
    private const RESERVED = [
        'api',
        'assets',
        'build',
        'catalog',
        'confirm-password',
        'creator',
        'csrf-token',
        'dashboard',
        'editor',
        'email',
        'forgot-password',
        'login',
        'logout',
        'my-profile',
        'my-twibbon',
        'register',
        'reset-password',
        'sanctum',
        'settings',
        'storage',
        'twibbon',
        'two-factor-challenge',
        'upload',
        'verify-email',
    ];

    public static function normalize(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $normalized = Str::slug($value);

        return $normalized === '' ? null : $normalized;
    }

    public static function isReserved(string $path): bool
    {
        return in_array($path, self::RESERVED, true);
    }

    public static function isTaken(
        string $path,
        ?int $ignoreTwiboneId = null,
        ?int $ignoreShortLinkId = null,
    ): bool {
        $usedByTwibbon = DB::table('twibone')
            ->where('custom_url', $path)
            ->when($ignoreTwiboneId !== null, function ($query) use ($ignoreTwiboneId): void {
                $query->where('id', '!=', $ignoreTwiboneId);
            })
            ->exists();

        if ($usedByTwibbon) {
            return true;
        }

        return DB::table('short_links')
            ->where('slug', $path)
            ->when($ignoreShortLinkId !== null, function ($query) use ($ignoreShortLinkId): void {
                $query->where('id', '!=', $ignoreShortLinkId);
            })
            ->exists();
    }

    public static function isAvailable(
        string $path,
        ?int $ignoreTwiboneId = null,
        ?int $ignoreShortLinkId = null,
    ): bool {
        if (self::isReserved($path)) {
            return false;
        }

        return ! self::isTaken($path, $ignoreTwiboneId, $ignoreShortLinkId);
    }
}
