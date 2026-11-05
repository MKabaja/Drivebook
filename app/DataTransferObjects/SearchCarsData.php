<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Enums\Transmission;
use App\Http\Requests\SearchCarsRequest;

final readonly class SearchCarsData
{
    public function __construct(
        public ?RentalPeriod $period = null,
        public ?int $minimumSeats = null,
        public ?Transmission $transmission = null,
        public int $page = 1,
    ) {}

    public static function fromRequest(SearchCarsRequest $request): self
    {
        $payload = $request->safe();

        return new self(
            period: RentalPeriod::fromRequest($request),
            minimumSeats: $payload->has('seats') ? $payload->integer('seats') : null,
            transmission: $payload->enum('transmission', Transmission::class),
            page: $payload->integer('page', 1),
        );
    }
}
