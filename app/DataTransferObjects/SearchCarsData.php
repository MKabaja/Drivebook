<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Enums\Transmission;
use App\Http\Requests\SearchCarsRequest;

/**
 * A `null` filter is skipped; with `dates` only cars free on them are returned.
 */
final readonly class SearchCarsData
{
    public function __construct(
        public ?RentalDates $dates = null,
        public ?int $minimumSeats = null,
        public ?Transmission $transmission = null,
        /** @var positive-int */
        public int $page = 1,
    ) {}

    public static function fromRequest(SearchCarsRequest $request): self
    {
        $payload = $request->safe();

        return new self(
            dates: RentalDates::fromRequest($request),
            minimumSeats: $payload->has('seats') ? $payload->integer('seats') : null,
            transmission: $payload->enum('transmission', Transmission::class),
            page: $payload->integer('page', 1),
        );
    }
}
