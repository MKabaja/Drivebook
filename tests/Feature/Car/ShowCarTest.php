<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\Car;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
});

test('car details without dates have no rental fields', function () {
    $car = Car::factory()->create();

    $this->getJson("/api/cars/{$car->id}")
        ->assertOk()
        ->assertExactJsonStructure(['data' => ['id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset']]);
});

test('car details price free dates', function () {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 16000]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertExactJsonStructure(['data' => [
            'id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset',
            'price' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
            'is_available', 'alternative_dates',
        ]])
        ->assertJsonPath('data.price', [
            'starts_on' => '2030-06-10',
            'ends_on' => '2030-06-13',
            'rental_days' => 3,
            'daily_rate_in_grosze' => 16000,
            'total_price_in_grosze' => 48000,
        ])
        ->assertJsonPath('data.is_available', true)
        ->assertJsonPath('data.alternative_dates', null);
});

test('availability depends only on confirmed overlapping bookings', function (string $status, string $startsOn, string $endsOn, bool $expected) {
    $car = Car::factory()->create();
    $booking = $status === 'cancelled' ? Booking::factory()->cancelled() : Booking::factory();
    $booking->create(['car_id' => $car->id, 'starts_on' => $startsOn, 'ends_on' => $endsOn]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertJsonPath('data.is_available', $expected)
        ->assertJsonPath('data.price.rental_days', 3);
})->with([
    'confirmed overlap' => ['confirmed', '2030-06-12', '2030-06-15', false],
    'cancelled overlap' => ['cancelled', '2030-06-12', '2030-06-15', true],
    'confirmed touching end' => ['confirmed', '2030-06-13', '2030-06-15', true],
    'confirmed touching start' => ['confirmed', '2030-06-08', '2030-06-10', true],
]);

test('busy car suggests the next rental of equal length', function () {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 16900]);
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);
    Booking::factory()->cancelled()->create(['car_id' => $car->id, 'starts_on' => '2030-06-12', 'ends_on' => '2030-06-20']);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertExactJsonStructure(['data' => [
            'id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset',
            'price' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
            'is_available',
            'alternative_dates' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
        ]])
        ->assertJsonPath('data.is_available', false)
        ->assertJsonPath('data.alternative_dates', [
            'starts_on' => '2030-06-12',
            'ends_on' => '2030-06-15',
            'rental_days' => 3,
            'daily_rate_in_grosze' => 16900,
            'total_price_in_grosze' => 50700,
        ]);
});

test('confirmed bookings of other cars do not affect the proposal', function () {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 16900]);
    $other = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);
    Booking::factory()->create(['car_id' => $other->id, 'starts_on' => '2030-06-12', 'ends_on' => '2030-06-20']);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertJsonPath('data.alternative_dates.starts_on', '2030-06-12')
        ->assertJsonPath('data.alternative_dates.ends_on', '2030-06-15');
});

test('busy car without a free slot returns null with the full response shape', function () {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-01', 'ends_on' => '2030-08-01']);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertExactJsonStructure(['data' => [
            'id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset',
            'price' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
            'is_available', 'alternative_dates',
        ]])
        ->assertJsonPath('data.is_available', false)
        ->assertJsonPath('data.alternative_dates', null);
});

test('proposal window ends 30 days after the requested pickup', function (string $bookingEnd, ?string $expectedStart, ?string $expectedEnd) {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-01', 'ends_on' => $bookingEnd]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertJsonPath('data.is_available', false)
        ->assertJsonPath('data.alternative_dates.starts_on', $expectedStart)
        ->assertJsonPath('data.alternative_dates.ends_on', $expectedEnd);
})->with([
    'free from the last day of the window' => ['2030-07-10', '2030-07-10', '2030-07-13'],
    'free only the day after the window' => ['2030-07-11', null, null],
]);

test('a booking starting after the last pickup day still blocks the last slot', function () {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-07-10']);
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-07-11', 'ends_on' => '2030-07-15']);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertJsonPath('data.is_available', false)
        ->assertJsonPath('data.alternative_dates', null);
});

test('proposal never exceeds the booking horizon', function (string $bookingEnd, ?string $expectedStart) {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-11-25', 'ends_on' => $bookingEnd]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-11-25&ends_on=2030-11-27")
        ->assertOk()
        ->assertJsonPath('data.is_available', false)
        ->assertJsonPath('data.alternative_dates.starts_on', $expectedStart);
})->with([
    'free slot would start after the last pickup day' => ['2030-11-29', null],
    'free slot starts on the last pickup day' => ['2030-11-28', '2030-11-28'],
]);

test('unknown car returns 404', function () {
    $this->getJson('/api/cars/999999')
        ->assertNotFound()
        ->assertExactJson(['message' => 'Car not found.']);
});

test('unknown route keeps the default 404', function () {
    $this->getJson('/api/unknown-endpoint')
        ->assertNotFound()
        ->assertJsonMissing(['message' => 'Car not found.']);
});

test('car details validate dates like the search', function () {
    $car = Car::factory()->create();

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-01&ends_on=2030-06-03")
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['starts_on']);
});
