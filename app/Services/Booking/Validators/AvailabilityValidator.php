<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Models\Booking;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use Illuminate\Validation\ValidationException;

final class AvailabilityValidator implements BookingValidatorInterface
{
    public function validate(BookingData $data): void
    {
        $isBooked = Booking::query()
            ->where('car_id', $data->carId)
            ->active()
            ->overlapping($data->startsOn, $data->endsOn)
            ->exists();

        if ($isBooked) {
            throw ValidationException::withMessages([
                'starts_on' => 'This car is already booked for the selected dates.',
            ]);
        }
    }
}
