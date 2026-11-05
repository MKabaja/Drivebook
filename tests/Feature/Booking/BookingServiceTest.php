<?php

declare(strict_types=1);

use App\DataTransferObjects\BookingData;
use App\Models\Car;
use App\Models\User;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('the service rejects equal dates even without request validation', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
    $car = Car::factory()->create();
    $user = User::factory()->create();
    $date = CarbonImmutable::parse('2030-06-10', 'Europe/Warsaw');
    $data = new BookingData($car->id, $user->id, $date, $date, $car->daily_rate_in_grosze);

    expect(fn () => app(BookingService::class)->store($data))->toThrow(ValidationException::class);

    $this->assertDatabaseCount('bookings', 0);
});
