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
        ->assertExactJsonStructure(['data' => ['id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_path']]);
});

test('car details quote a free period', function () {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 16000]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertExactJsonStructure(['data' => [
            'id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_path',
            'quote' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
            'is_available',
        ]])
        ->assertJsonPath('data.quote', [
            'starts_on' => '2030-06-10',
            'ends_on' => '2030-06-13',
            'rental_days' => 3,
            'daily_rate_in_grosze' => 16000,
            'total_price_in_grosze' => 48000,
        ])
        ->assertJsonPath('data.is_available', true);
});

test('availability depends only on confirmed overlapping bookings', function (string $status, string $startsOn, string $endsOn, bool $expected) {
    $car = Car::factory()->create();
    $booking = $status === 'cancelled' ? Booking::factory()->cancelled() : Booking::factory();
    $booking->create(['car_id' => $car->id, 'starts_on' => $startsOn, 'ends_on' => $endsOn]);

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-10&ends_on=2030-06-13")
        ->assertOk()
        ->assertJsonPath('data.is_available', $expected)
        ->assertJsonPath('data.quote.rental_days', 3);
})->with([
    'confirmed overlap' => ['confirmed', '2030-06-12', '2030-06-15', false],
    'cancelled overlap' => ['cancelled', '2030-06-12', '2030-06-15', true],
    'confirmed touching end' => ['confirmed', '2030-06-13', '2030-06-15', true],
    'confirmed touching start' => ['confirmed', '2030-06-08', '2030-06-10', true],
]);

test('unknown car returns 404', function () {
    $this->getJson('/api/cars/999999')->assertNotFound();
});

test('car details validate dates like the search', function () {
    $car = Car::factory()->create();

    $this->getJson("/api/cars/{$car->id}?starts_on=2030-06-01&ends_on=2030-06-03")
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['starts_on']);
});
