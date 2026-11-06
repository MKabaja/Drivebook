<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Config;

/** @extends Factory<Booking> */
class BookingFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $timezone = Config::string('rental.timezone');

        return [
            'car_id' => Car::factory(),
            'user_id' => User::factory(),
            'starts_on' => CarbonImmutable::now($timezone)->addDay()->toDateString(),
            'ends_on' => fn (array $attributes): string => CarbonImmutable::parse($attributes['starts_on'], $timezone)->addDays(2)->toDateString(),
            'status' => BookingStatus::Confirmed,
            'daily_rate_in_grosze' => fn (array $attributes): int => Car::query()->findOrFail($attributes['car_id'])->daily_rate_in_grosze,
            'total_price_in_grosze' => fn (array $attributes): int => (int) CarbonImmutable::parse($attributes['starts_on'], $timezone)
                ->diffInDays(CarbonImmutable::parse($attributes['ends_on'], $timezone)) * $attributes['daily_rate_in_grosze'],
        ];
    }

    public function cancelled(): static
    {
        return $this->state(['status' => BookingStatus::Cancelled]);
    }
}
