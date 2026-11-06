<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Http\Requests\SearchCarsRequest;
use App\Http\Requests\ShowCarRequest;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;

/**
 * Half-open range `[startsOn, endsOn)`; both dates at midnight in `rental.timezone`.
 */
final readonly class RentalDates
{
    public function __construct(
        public CarbonImmutable $startsOn,
        public CarbonImmutable $endsOn,
    ) {}

    public function rentalDays(): int
    {
        return (int) CarbonImmutable::parse($this->startsOn->toDateString(), 'UTC')
            ->diffInDays(CarbonImmutable::parse($this->endsOn->toDateString(), 'UTC'));
    }

    /** @return self|null `null` when the request has no dates */
    public static function fromRequest(SearchCarsRequest|ShowCarRequest $request): ?self
    {
        $payload = $request->safe();

        if (! $payload->has(['starts_on', 'ends_on'])) {
            return null;
        }

        return self::fromDateStrings(
            $payload->string('starts_on')->toString(),
            $payload->string('ends_on')->toString(),
        );
    }

    public static function fromDateStrings(string $startsOn, string $endsOn): self
    {
        return new self(self::parseDate($startsOn), self::parseDate($endsOn));
    }

    private static function parseDate(string $date): CarbonImmutable
    {
        return CarbonImmutable::parse($date, Config::string('rental.timezone'))->startOfDay();
    }
}
