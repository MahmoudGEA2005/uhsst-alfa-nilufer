<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'name' => 'Atatürk Caddesi',
                'longitude' => '29.0680',
                'latitude' => '40.1950',
                'population' => 15000,
                'home_residences' => 450,
                'companies' => 25,
                'stores' => 80,
            ],
            [
                'name' => 'Nilüfer Sokak',
                'longitude' => '29.0200',
                'latitude' => '40.2100',
                'population' => 12000,
                'home_residences' => 380,
                'companies' => 15,
                'stores' => 60,
            ],
            [
                'name' => 'Fethiye Mahallesi',
                'longitude' => '29.0350',
                'latitude' => '40.2050',
                'population' => 18000,
                'home_residences' => 520,
                'companies' => 35,
                'stores' => 95,
            ],
            [
                'name' => 'Özlüce Mahallesi',
                'longitude' => '29.0150',
                'latitude' => '40.1850',
                'population' => 22000,
                'home_residences' => 650,
                'companies' => 45,
                'stores' => 120,
            ],
            [
                'name' => 'Beşevler Mahallesi',
                'longitude' => '29.0420',
                'latitude' => '40.2120',
                'population' => 16000,
                'home_residences' => 480,
                'companies' => 28,
                'stores' => 85,
            ],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
