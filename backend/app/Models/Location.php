<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'longitude',
        'latitude',
        'population',
        'home_residences',
        'companies',
        'stores',
    ];

    protected $casts = [
        'longitude' => 'decimal:7',
        'latitude' => 'decimal:7',
        'population' => 'integer',
        'home_residences' => 'integer',
        'companies' => 'integer',
        'stores' => 'integer',
    ];
}
