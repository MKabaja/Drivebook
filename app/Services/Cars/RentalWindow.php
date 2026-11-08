<?php

declare(strict_types=1);

namespace App\Services\Cars;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;

final class RentalWindow
{
    /** @return string|null error message for the user, `null` when allowed */
    public function pickupViolation(CarbonImmutable $startsOn): ?string
    {
        $pickupDate = $startsOn->toDateString();
        $isBeforeEarliestPickup = $pickupDate < $this->earliestPickupDate()->toDateString();
        $isAfterLatestPickup = $pickupDate > $this->latestPickupDate()->toDateString();

        if ($isBeforeEarliestPickup) {
            return 'Pickup is available from tomorrow.';
        }

        if ($isAfterLatestPickup) {
            $horizonInDays = Config::integer('rental.booking_horizon_days');

            return "Pickup must be within {$horizonInDays} days from today.";
        }

        return null;
    }

    /** @return string|null error message for the user, `null` when allowed */
    public function lengthViolation(CarbonImmutable $startsOn, CarbonImmutable $endsOn): ?string
    {
        $maxRentalDays = Config::integer('rental.max_rental_days');
        $latestReturnDate = $startsOn->addDays($maxRentalDays);
        $isLongerThanAllowed = $endsOn->toDateString() > $latestReturnDate->toDateString();

        if ($isLongerThanAllowed) {
            return "A rental can last at most {$maxRentalDays} days.";
        }

        return null;
    }

    public function latestPickupDate(): CarbonImmutable
    {
        return $this->today()->addDays(Config::integer('rental.booking_horizon_days'));
    }

    private function earliestPickupDate(): CarbonImmutable
    {
        return $this->today()->addDay();
    }

    private function today(): CarbonImmutable
    {
        return CarbonImmutable::now(Config::string('rental.timezone'))->startOfDay();
    }
}
