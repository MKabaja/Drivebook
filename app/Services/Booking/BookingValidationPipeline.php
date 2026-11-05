<?php

declare(strict_types=1);

namespace App\Services\Booking;

use App\DataTransferObjects\BookingData;
use App\Services\Booking\Contracts\BookingValidatorInterface;

final class BookingValidationPipeline
{
    /** @param list<BookingValidatorInterface> $validators */
    public function __construct(private readonly array $validators) {}

    public function validate(BookingData $data): void
    {
        foreach ($this->validators as $validator) {
            $validator->validate($data);
        }
    }
}
