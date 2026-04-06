<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShortLinkClick extends Model
{
    protected $fillable = [
        'short_link_id',
        'ip_address',
        'agent',
    ];

    public function shortLink(): BelongsTo
    {
        return $this->belongsTo(ShortLink::class, 'short_link_id');
    }
}
