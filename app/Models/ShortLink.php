<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShortLink extends Model
{
    protected $table = 'short_links';

    protected $fillable = [
        'users_uid',
        'label',
        'slug',
        'target_url',
        'is_private',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_uid');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(ShortLinkClick::class, 'short_link_id');
    }
}
