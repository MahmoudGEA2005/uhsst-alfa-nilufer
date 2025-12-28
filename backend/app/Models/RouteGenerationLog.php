<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteGenerationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'generation_date',
        'generated_at',
        'admin_id',
        'drivers_count',
        'locations_count',
        'status',
    ];

    protected $casts = [
        'generation_date' => 'date',
        'generated_at' => 'datetime',
        'drivers_count' => 'integer',
        'locations_count' => 'integer',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
