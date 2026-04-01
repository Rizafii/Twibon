<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwiboneUsed extends Model
{
    protected $table = 'twibone_used';

    protected $fillable = [
        'twibone_uid',
        'ip_address',
        'agent',
    ];

    public function twibone(): BelongsTo
    {
        return $this->belongsTo(Twibone::class, 'twibone_uid');
    }
}
