<?php

declare(strict_types=1);

namespace App\Services\Cars;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;

final class RentalWindow
{
    public function pickupViolation(CarbonImmutable $startsOn): ?string
    {
        $today = CarbonImmutable::now(Config::string('rental.timezone'))->startOfDay();
        $horizonInDays = Config::integer('rental.booking_horizon_days');
        $pickupDate = $startsOn->toDateString();

        if ($pickupDate <= $today->toDateString()) {
            return 'Pickup is available from tomorrow.';
        }

        if ($pickupDate > $today->addDays($horizonInDays)->toDateString()) {
            return "Pickup must be within {$horizonInDays} days from today.";
        }

        return null;
    }

    public function lengthViolation(CarbonImmutable $startsOn, CarbonImmutable $endsOn): ?string
    {
        $maxRentalDays = Config::integer('rental.max_rental_days');

        if ($startsOn->addDays($maxRentalDays)->toDateString() < $endsOn->toDateString()) {
            return "A rental can last at most {$maxRentalDays} days.";
        }

        return null;
    }
}
