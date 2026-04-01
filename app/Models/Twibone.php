<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Twibone extends Model
{
    protected $table = 'twibone';

    protected $fillable = [
        'name',
        'description',
        'path',
        'url',
        'users_uid',
        'is_approved',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_uid');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(TwiboneUsed::class, 'twibone_uid');
    }

    public function links(): HasMany
    {
        return $this->hasMany(Link::class, 'twibone_uid');
    }
}