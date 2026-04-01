<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkClick extends Model
{
    protected $table = 'link_click';

    protected $fillable = [
        'link_uid',
        'ip_address',
        'agent',
    ];

    public function link(): BelongsTo
    {
        return $this->belongsTo(Link::class, 'link_uid');
    }
}
