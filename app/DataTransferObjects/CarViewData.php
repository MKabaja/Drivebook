<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Car;

/**
 * `rentalAvailability` is `null` when no dates were requested; the API response then omits all rental fields.
 */
final readonly class CarViewData
{
    private function __construct(
        public Car $car,
        public ?RentalAvailability $rentalAvailability,
    ) {}

    public static function withoutDates(Car $car): self
    {
        return new self($car, rentalAvailability: null);
    }

    public static function forDates(Car $car, RentalAvailability $rentalAvailability): self
    {
        return new self($car, $rentalAvailability);
    }
}
