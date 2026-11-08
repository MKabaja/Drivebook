<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CarCategory;
use App\Enums\Transmission;
use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Car> */
class CarFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => 'Porsche Panamera',
            'seats' => 4,
            'transmission' => Transmission::Automatic,
            'category' => CarCategory::Premium,
            'daily_rate_in_grosze' => 64900,
            'image_path' => 'cars/porsche-panamera',
        ];
    }
}
