<?php

declare(strict_types=1);

use App\DataTransferObjects\RentalDates;
use App\Services\Cars\AlternativeDatesFinder;
use Carbon\CarbonImmutable;

function finderDate(string $date): CarbonImmutable
{
    return CarbonImmutable::parse($date, 'Europe/Warsaw');
}

function finderDates(string $startsOn, string $endsOn): RentalDates
{
    return new RentalDates(finderDate($startsOn), finderDate($endsOn));
}

test('it proposes the earliest free slot of equal length', function (array $booked, ?array $expected) {
    $proposal = (new AlternativeDatesFinder)->findEarliestFreeDates(
        finderDates('2030-06-10', '2030-06-13'),
        array_map(fn (array $dates): RentalDates => finderDates(...$dates), $booked),
        finderDate('2030-07-10'),
    );

    expect($proposal?->startsOn->toDateString())->toBe($expected[0] ?? null)
        ->and($proposal?->endsOn->toDateString())->toBe($expected[1] ?? null);
})->with([
    'gap exactly fits' => [[['2030-06-10', '2030-06-11'], ['2030-06-14', '2030-06-16']], ['2030-06-11', '2030-06-14']],
    'gap one day too short' => [[['2030-06-10', '2030-06-12'], ['2030-06-14', '2030-06-16']], ['2030-06-16', '2030-06-19']],
    'touching bookings form one block' => [[['2030-06-10', '2030-06-12'], ['2030-06-12', '2030-06-14']], ['2030-06-14', '2030-06-17']],
    'unsorted input' => [[['2030-06-14', '2030-06-16'], ['2030-06-10', '2030-06-12']], ['2030-06-16', '2030-06-19']],
    'booking started before the request' => [[['2030-06-01', '2030-06-20']], ['2030-06-20', '2030-06-23']],
    'start exactly on the latest pickup date' => [[['2030-06-10', '2030-07-10']], ['2030-07-10', '2030-07-13']],
    'start one day after the latest pickup date' => [[['2030-06-10', '2030-07-11']], null],
    'whole window covered' => [[['2030-06-01', '2030-08-01']], null],
    'nested bookings' => [[['2030-06-10', '2030-06-20'], ['2030-06-12', '2030-06-15']], ['2030-06-20', '2030-06-23']],
    'proposal starts the day after the request' => [[['2030-06-20', '2030-06-25']], ['2030-06-11', '2030-06-14']],
]);

test('it keeps the rental length across a daylight saving change and a month boundary', function () {
    $proposal = (new AlternativeDatesFinder)->findEarliestFreeDates(
        finderDates('2030-03-30', '2030-04-01'),
        [finderDates('2030-03-30', '2030-03-31'), finderDates('2030-04-02', '2030-04-05')],
        finderDate('2030-04-29'),
    );

    expect($proposal?->startsOn->toDateString())->toBe('2030-03-31')
        ->and($proposal?->endsOn->toDateString())->toBe('2030-04-02');
});

test('it returns null when the request starts on the latest allowed pickup', function () {
    $proposal = (new AlternativeDatesFinder)->findEarliestFreeDates(
        finderDates('2030-06-10', '2030-06-13'),
        [finderDates('2030-06-10', '2030-06-13')],
        finderDate('2030-06-10'),
    );

    expect($proposal)->toBeNull();
});
