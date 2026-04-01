<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Link extends Model
{
    protected $table = 'link';

    protected $fillable = [
        'twibone_uid',
        'label',
        'url',
    ];

    public function twibone(): BelongsTo
    {
        return $this->belongsTo(Twibone::class, 'twibone_uid');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(LinkClick::class, 'link_uid');
    }
}
