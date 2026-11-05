<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Http\Requests\StoreBookingRequest;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;

final readonly class BookingData
{
    public function __construct(
        public int $carId,
        public int $userId,
        public CarbonImmutable $startsOn,
        public CarbonImmutable $endsOn,
        public int $expectedDailyRateInGrosze,
    ) {}

    public static function fromRequest(StoreBookingRequest $request, int $userId): self
    {
        $payload = $request->safe();

        return new self(
            carId: $payload->integer('car_id'),
            userId: $userId,
            startsOn: CarbonImmutable::parse($payload->string('starts_on')->toString(), Config::string('rental.timezone'))->startOfDay(),
            endsOn: CarbonImmutable::parse($payload->string('ends_on')->toString(), Config::string('rental.timezone'))->startOfDay(),
            expectedDailyRateInGrosze: $payload->integer('expected_daily_rate_in_grosze'),
        );
    }
}
