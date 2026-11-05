<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Car;

final readonly class CarViewData
{
    private function __construct(
        public Car $car,
        public ?RentalQuote $quote,
        public ?bool $isAvailable,
    ) {}

    public static function withoutPeriod(Car $car): self
    {
        return new self($car, null, null);
    }

    public static function forPeriod(Car $car, RentalQuote $quote, bool $isAvailable): self
    {
        return new self($car, $quote, $isAvailable);
    }
}
