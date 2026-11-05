<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use Illuminate\Validation\ValidationException;

final class DateOrderValidator implements BookingValidatorInterface
{
    public function validate(BookingData $data): void
    {
        if ($data->endsOn->toDateString() <= $data->startsOn->toDateString()) {
            throw ValidationException::withMessages([
                'ends_on' => 'Return date must be after pickup date.',
            ]);
        }
    }
}
