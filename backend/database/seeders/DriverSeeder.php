<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Driver;
use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Driver::create([
            'email' => 'driver@test.com',
            'first_name' => 'Ahmet',
            'last_name' => 'Yılmaz',
            'phone_number' => '+905551234567',
            'license_number' => 'DRV123456',
            'password' => Hash::make('password123'),
            'id_number' => '12345678901',
            'vehicle_number' => '34ABC123',
        ]);
    }
}
