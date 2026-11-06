<?php

declare(strict_types=1);

namespace App\Services\Booking\Contracts;

use App\DataTransferObjects\BookingData;
use Illuminate\Validation\ValidationException;

/**
 * Runs inside the booking transaction, after the car row is locked.
 */
interface BookingValidatorInterface
{
    /** @throws ValidationException keyed by request field */
    public function validate(BookingData $data): void;
}
