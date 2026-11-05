<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Car;

final readonly class CarViewData
{
    public function __construct(
        public Car $car,
        public ?RentalQuote $quote = null,
        public ?bool $availability = null,
        public ?RentalQuote $alternativeDates = null,
    ) {}
}
