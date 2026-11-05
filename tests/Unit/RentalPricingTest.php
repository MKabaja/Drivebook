<?php

declare(strict_types=1);

use App\Services\Cars\RentalPricing;
use Carbon\CarbonImmutable;

test('rental days are the difference of calendar dates regardless of time zones', function (CarbonImmutable $start, CarbonImmutable $end, int $expectedDays) {
    $quote = (new RentalPricing)->quote($start, $end, 10000);

    expect($quote->rentalDays)->toBe($expectedDays)
        ->and($quote->totalPriceInGrosze)->toBe($expectedDays * 10000);
})->with([
    'plain dates' => [fn () => CarbonImmutable::parse('2030-06-10', 'Europe/Warsaw'), fn () => CarbonImmutable::parse('2030-06-12', 'Europe/Warsaw'), 2],
    'spring DST change' => [fn () => CarbonImmutable::parse('2030-03-30', 'Europe/Warsaw'), fn () => CarbonImmutable::parse('2030-04-01', 'Europe/Warsaw'), 2],
    'autumn DST change' => [fn () => CarbonImmutable::parse('2030-10-26', 'Europe/Warsaw'), fn () => CarbonImmutable::parse('2030-10-28', 'Europe/Warsaw'), 2],
    'start in UTC, end in Warsaw' => [fn () => CarbonImmutable::parse('2030-03-30', 'UTC'), fn () => CarbonImmutable::parse('2030-04-01', 'Europe/Warsaw'), 2],
    'start in Warsaw, end in UTC' => [fn () => CarbonImmutable::parse('2030-10-26', 'Europe/Warsaw'), fn () => CarbonImmutable::parse('2030-10-28', 'UTC'), 2],
]);
