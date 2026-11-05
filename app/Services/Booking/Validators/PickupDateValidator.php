<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\ValidationException;

final class PickupDateValidator implements BookingValidatorInterface
{
    public function validate(BookingData $data): void
    {
        $today = CarbonImmutable::now(Config::string('rental.timezone'))->startOfDay();
        $horizonInDays = Config::integer('rental.booking_horizon_days');
        $pickupDate = $data->startsOn->toDateString();

        if ($pickupDate <= $today->toDateString()) {
            throw ValidationException::withMessages([
                'starts_on' => 'Pickup is available from tomorrow.',
            ]);
        }

        if ($pickupDate > $today->addDays($horizonInDays)->toDateString()) {
            throw ValidationException::withMessages([
                'starts_on' => "Pickup must be within {$horizonInDays} days from today.",
            ]);
        }
    }
}
