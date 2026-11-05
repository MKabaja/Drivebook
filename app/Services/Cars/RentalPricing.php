<?php

declare(strict_types=1);

namespace App\Services\Cars;

use App\DataTransferObjects\RentalQuote;
use Carbon\CarbonImmutable;

final class RentalPricing
{
    public function quote(CarbonImmutable $startsOn, CarbonImmutable $endsOn, int $dailyRateInGrosze): RentalQuote
    {
        $startsOn = $startsOn->startOfDay();
        $endsOn = $endsOn->startOfDay();
        $rentalDays = (int) CarbonImmutable::parse($startsOn->toDateString(), 'UTC')
            ->diffInDays(CarbonImmutable::parse($endsOn->toDateString(), 'UTC'));

        return new RentalQuote($startsOn, $endsOn, $rentalDays, $dailyRateInGrosze, $rentalDays * $dailyRateInGrosze);
    }
}
