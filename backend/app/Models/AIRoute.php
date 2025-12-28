<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIRoute extends Model
{
    /**
     * Tablo adını manuel olarak belirt (Laravel varsayılan olarak a_i_routes yapıyor)
     */
    protected $table = 'ai_routes';

    protected $fillable = [
        'driver_id',
        'route_data',
        'waypoints',
        'status',
        'scheduled_at',
        'completed_at',
    ];

    protected $casts = [
        'route_data' => 'array',
        'waypoints' => 'array',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
