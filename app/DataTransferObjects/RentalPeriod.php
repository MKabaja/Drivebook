<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Http\Requests\SearchCarsRequest;
use App\Http\Requests\ShowCarRequest;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Config;

final readonly class RentalPeriod
{
    public function __construct(
        public CarbonImmutable $startsOn,
        public CarbonImmutable $endsOn,
    ) {}

    public static function fromRequest(SearchCarsRequest|ShowCarRequest $request): ?self
    {
        $payload = $request->safe();

        if (! $payload->has(['starts_on', 'ends_on'])) {
            return null;
        }

        return new self(
            startsOn: self::parseDate($payload->string('starts_on')->toString()),
            endsOn: self::parseDate($payload->string('ends_on')->toString()),
        );
    }

    private static function parseDate(string $date): CarbonImmutable
    {
        return CarbonImmutable::parse($date, Config::string('rental.timezone'))->startOfDay();
    }
}
