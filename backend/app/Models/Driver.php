<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Driver extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'license_number',
        'password',
        'id_number',
        'vehicle_number',
        'image',
    ];

    protected $hidden = [
        'password',
    ];
}
