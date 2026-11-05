<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use App\Services\Cars\RentalWindow;
use Illuminate\Validation\ValidationException;

final class RentalLengthValidator implements BookingValidatorInterface
{
    public function __construct(private readonly RentalWindow $rentalWindow) {}

    public function validate(BookingData $data): void
    {
        $violation = $this->rentalWindow->lengthViolation($data->startsOn, $data->endsOn);

        if ($violation !== null) {
            throw ValidationException::withMessages(['ends_on' => $violation]);
        }
    }
}
