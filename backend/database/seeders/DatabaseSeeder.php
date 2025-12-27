<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use App\Models\Driver;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seed Admin
        Admin::create([
            'email' => 'mahmoud.ea2005@gmail.com',
            'name' => 'Mahmoud',
            'password' => Hash::make('llllllll'),
            'admin_id_number' => 'ADM001',
            'phone_number' => '+905551234567',
            'image' => 'red_user.jpg',
        ]);

        // Seed Driver
        Driver::create([
            'email' => 'driver@test.com',
            'first_name' => 'Ahmet',
            'last_name' => 'Yılmaz',
            'phone_number' => '+905559876543',
            'license_number' => 'DRV123456',
            'password' => Hash::make('password123'),
            'id_number' => '12345678901',
            'vehicle_number' => '34ABC123',
            'image' => 'user.jpg',
        ]);
    }
}

