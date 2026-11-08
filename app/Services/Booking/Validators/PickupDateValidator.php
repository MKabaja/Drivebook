<?php

declare(strict_types=1);

namespace App\Services\Booking\Validators;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use App\Services\Cars\RentalWindow;
use Illuminate\Validation\ValidationException;

final class PickupDateValidator implements BookingValidatorInterface
{
    public function __construct(private readonly RentalWindow $rentalWindow) {}

    public function validate(BookingData $data): void
    {
        $violation = $this->rentalWindow->pickupViolation($data->startsOn);

        if ($violation !== null) {
            throw ValidationException::withMessages(['starts_on' => $violation]);
        }
    }
}
