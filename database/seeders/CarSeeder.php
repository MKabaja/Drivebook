<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CarCategory;
use App\Enums\Transmission;
use App\Models\Car;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CarSeeder extends Seeder
{
    private const string IMAGE_DIRECTORY = 'cars';

    public function run(): void
    {
        $cars = [
            ['Toyota Yaris', 5, Transmission::Manual, CarCategory::City, 9900],
            ['Volkswagen Polo', 5, Transmission::Manual, CarCategory::City, 11900],
            ['Volkswagen Golf', 5, Transmission::Manual, CarCategory::Compact, 14900],
            ['Toyota Corolla', 5, Transmission::Automatic, CarCategory::Compact, 16900],
            ['Skoda Octavia Combi', 5, Transmission::Manual, CarCategory::Family, 17900],
            ['Volvo V60 Cross Country', 5, Transmission::Automatic, CarCategory::Family, 27900],
            ['Dacia Duster', 5, Transmission::Manual, CarCategory::Suv, 15900],
            ['Kia Sportage', 5, Transmission::Automatic, CarCategory::Suv, 22900],
            ['Toyota RAV4', 5, Transmission::Automatic, CarCategory::Suv, 24900],
            ['Kia Carnival', 8, Transmission::Automatic, CarCategory::Van, 32900],
            ['Volkswagen Multivan', 7, Transmission::Automatic, CarCategory::Van, 34900],
            ['Audi RS6 Avant', 5, Transmission::Automatic, CarCategory::Premium, 59900],
            ['Porsche Panamera', 4, Transmission::Automatic, CarCategory::Premium, 64900],
            ['BMW M5', 5, Transmission::Automatic, CarCategory::Premium, 69900],
            ['Ford Mustang', 4, Transmission::Manual, CarCategory::Sport, 44900],
            ['Chevrolet Camaro', 4, Transmission::Automatic, CarCategory::Sport, 74900],
            ['Mercedes-AMG GT', 2, Transmission::Automatic, CarCategory::Sport, 89900],
            ['Ferrari 458 Italia', 2, Transmission::Automatic, CarCategory::Sport, 149900],
        ];

        foreach ($cars as [$name, $seats, $transmission, $category, $dailyRateInGrosze]) {
            $imageName = Str::slug($name);
            $this->publishImage($imageName);

            Car::updateOrCreate(['name' => $name], [
                'seats' => $seats,
                'transmission' => $transmission,
                'category' => $category,
                'daily_rate_in_grosze' => $dailyRateInGrosze,
                'image_path' => self::IMAGE_DIRECTORY.'/'.$imageName,
            ]);
        }
    }

    private function publishImage(string $imageName): void
    {
        foreach (Config::array('rental.car_image_widths') as $widthInPixels) {
            $fileName = "{$imageName}-{$widthInPixels}.webp";
            $sourceFile = new File(database_path('seeders/images/cars/'.$fileName));

            Storage::disk('public')->putFileAs(self::IMAGE_DIRECTORY, $sourceFile, $fileName);
        }
    }
}
