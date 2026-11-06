<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CarCategory;
use App\Enums\Transmission;
use App\Models\Car;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        $cars = [
            ['Porsche Panamera', 4, Transmission::Automatic, CarCategory::GrandTourer, 64900],
            ['Chevrolet Camaro', 4, Transmission::Automatic, CarCategory::Muscle, 74900],
            ['Ford Mustang', 4, Transmission::Manual, CarCategory::Muscle, 44900],
            ['Mercedes-AMG GT', 2, Transmission::Automatic, CarCategory::Sport, 89900],
            ['BMW M5', 5, Transmission::Automatic, CarCategory::Sedan, 69900],
            ['Audi RS6 Avant', 5, Transmission::Automatic, CarCategory::Estate, 59900],
            ['Ferrari 458 Italia', 2, Transmission::Automatic, CarCategory::Sport, 149900],
        ];

        foreach ($cars as [$name, $seats, $transmission, $category, $dailyRateInGrosze]) {
            Car::updateOrCreate(['name' => $name], [
                'seats' => $seats,
                'transmission' => $transmission,
                'category' => $category,
                'daily_rate_in_grosze' => $dailyRateInGrosze,
                'image_path' => '/images/cars/'.Str::slug($name).'.jpg',
            ]);
        }
    }
}
