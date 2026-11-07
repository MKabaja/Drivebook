<?php

declare(strict_types=1);

use App\Models\Car;
use Database\Seeders\CarSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('seeder creates the fleet with image files on the public disk', function () {
    Storage::fake('public');

    $this->seed(CarSeeder::class);

    expect(Car::count())->toBe(18);
    foreach (Car::all() as $car) {
        Storage::disk('public')->assertExists("{$car->image_path}-640.webp");
        Storage::disk('public')->assertExists("{$car->image_path}-1280.webp");
    }
});

test('seeding twice does not duplicate cars', function () {
    Storage::fake('public');

    $this->seed(CarSeeder::class);
    $this->seed(CarSeeder::class);

    expect(Car::count())->toBe(18);
});
