<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

/**
 * `alternativePrice` is `null` when the car is available or no free dates fit the alternative window.
 */
final readonly class RentalAvailability
{
    private function __construct(
        public RentalPrice $requestedPrice,
        public bool $isAvailable,
        public ?RentalPrice $alternativePrice,
    ) {}

    public static function available(RentalPrice $requestedPrice): self
    {
        return new self($requestedPrice, isAvailable: true, alternativePrice: null);
    }

    public static function unavailable(RentalPrice $requestedPrice, ?RentalPrice $alternativePrice): self
    {
        return new self($requestedPrice, isAvailable: false, alternativePrice: $alternativePrice);
    }
}
