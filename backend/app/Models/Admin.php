<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'email',
        'name',
        'password',
        'admin_id_number',
        'phone_number',
        'image',
    ];

    protected $hidden = [
        'password',
    ];
}
