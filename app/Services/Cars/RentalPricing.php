<?php

declare(strict_types=1);

namespace App\Services\Cars;

use App\DataTransferObjects\RentalDates;
use App\DataTransferObjects\RentalPrice;

final class RentalPricing
{
    public function priceFor(RentalDates $dates, int $dailyRateInGrosze): RentalPrice
    {
        $rentalDays = $dates->rentalDays();

        return new RentalPrice(
            startsOn: $dates->startsOn,
            endsOn: $dates->endsOn,
            rentalDays: $rentalDays,
            dailyRateInGrosze: $dailyRateInGrosze,
            totalPriceInGrosze: $rentalDays * $dailyRateInGrosze,
        );
    }
}
