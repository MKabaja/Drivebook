<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\ValidationException;

final class RentalLengthValidator implements BookingValidatorInterface
{
    public function validate(BookingData $data): void
    {
        $maxRentalDays = Config::integer('rental.max_rental_days');

        if ($data->startsOn->addDays($maxRentalDays)->toDateString() < $data->endsOn->toDateString()) {
            throw ValidationException::withMessages([
                'ends_on' => "A rental can last at most {$maxRentalDays} days.",
            ]);
        }
    }
}
