<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Carbon\CarbonImmutable;

final readonly class RentalQuote
{
    public function __construct(
        public CarbonImmutable $startsOn,
        public CarbonImmutable $endsOn,
        public int $rentalDays,
        public int $dailyRateInGrosze,
        public int $totalPriceInGrosze,
    ) {}

    /** @return array{starts_on: string, ends_on: string, rental_days: int, daily_rate_in_grosze: int, total_price_in_grosze: int} */
    public function toArray(): array
    {
        return [
            'starts_on' => $this->startsOn->toDateString(),
            'ends_on' => $this->endsOn->toDateString(),
            'rental_days' => $this->rentalDays,
            'daily_rate_in_grosze' => $this->dailyRateInGrosze,
            'total_price_in_grosze' => $this->totalPriceInGrosze,
        ];
    }
}
