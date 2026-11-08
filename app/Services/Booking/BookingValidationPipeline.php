<?php

declare(strict_types=1);

namespace App\Services\Booking;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;
use Illuminate\Validation\ValidationException;

final class BookingValidationPipeline
{
    /** @param list<BookingValidatorInterface> $validators */
    public function __construct(private readonly array $validators) {}

    /** @throws ValidationException from the first validator that rejects the booking */
    public function validate(BookingData $data): void
    {
        foreach ($this->validators as $validator) {
            $validator->validate($data);
        }
    }
}
