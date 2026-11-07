<?php

declare(strict_types=1);

use App\Enums\Transmission;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
});

test('guests browse the fleet without rental fields', function () {
    $cars = Car::factory()->count(2)->create();

    $response = $this->getJson('/api/cars');

    $response->assertOk()->assertExactJsonStructure([
        'data' => ['*' => ['id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset']],
        'links' => ['first', 'last', 'prev', 'next'],
        'meta' => ['current_page', 'from', 'last_page', 'links', 'path', 'per_page', 'to', 'total'],
    ])->assertJsonPath('data.0.category', 'premium');
    expect($response->json('data.*.id'))->toBe($cars->modelKeys());
});

test('cars come cheapest first, ties by id', function () {
    $a = Car::factory()->create(['daily_rate_in_grosze' => 30000]);
    $b = Car::factory()->create(['daily_rate_in_grosze' => 10000]);
    $c = Car::factory()->create(['daily_rate_in_grosze' => 10000]);

    $response = $this->getJson('/api/cars');

    $response->assertOk();
    expect($response->json('data.*.id'))->toBe([$b->id, $c->id, $a->id]);
});

test('car exposes responsive image urls', function () {
    Car::factory()->create(['image_path' => 'cars/kia-sportage']);

    $response = $this->getJson('/api/cars');

    $response->assertOk()
        ->assertJsonPath('data.0.image_url', '/storage/cars/kia-sportage-1280.webp')
        ->assertJsonPath('data.0.image_srcset', '/storage/cars/kia-sportage-640.webp 640w, /storage/cars/kia-sportage-1280.webp 1280w');
});

test('filters treat seats as a minimum and combine with transmission', function () {
    $a = Car::factory()->create(['seats' => 4, 'transmission' => Transmission::Automatic]);
    $b = Car::factory()->create(['seats' => 5, 'transmission' => Transmission::Automatic]);
    Car::factory()->create(['seats' => 2, 'transmission' => Transmission::Automatic]);
    Car::factory()->create(['seats' => 5, 'transmission' => Transmission::Manual]);

    $response = $this->getJson('/api/cars?seats=4&transmission=automatic');

    $response->assertOk();
    expect($response->json('data.*.id'))->toBe([$a->id, $b->id]);
});

test('rental dates hide cars booked on them and respect half-open boundaries', function () {
    $a = Car::factory()->create(['daily_rate_in_grosze' => 11100]);
    $b = Car::factory()->create(['daily_rate_in_grosze' => 22200]);
    $c = Car::factory()->create(['daily_rate_in_grosze' => 33300]);
    $d = Car::factory()->create(['daily_rate_in_grosze' => 44400]);
    $e = Car::factory()->create(['daily_rate_in_grosze' => 55500]);
    Booking::factory()->create(['car_id' => $a->id, 'starts_on' => '2030-06-08', 'ends_on' => '2030-06-10']);
    Booking::factory()->create(['car_id' => $b->id, 'starts_on' => '2030-06-12', 'ends_on' => '2030-06-14']);
    Booking::factory()->create(['car_id' => $c->id, 'starts_on' => '2030-06-11', 'ends_on' => '2030-06-12']);
    Booking::factory()->cancelled()->create(['car_id' => $d->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);
    Booking::factory()->create(['car_id' => $e->id, 'starts_on' => '2030-06-09', 'ends_on' => '2030-06-13']);

    $response = $this->getJson('/api/cars?starts_on=2030-06-10&ends_on=2030-06-12');

    $response->assertOk()
        ->assertExactJsonStructure([
            'data' => ['*' => [
                'id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset',
                'price' => ['starts_on', 'ends_on', 'rental_days', 'daily_rate_in_grosze', 'total_price_in_grosze'],
                'is_available', 'alternative_dates',
            ]],
            'links' => ['first', 'last', 'prev', 'next'],
            'meta' => ['current_page', 'from', 'last_page', 'links', 'path', 'per_page', 'to', 'total'],
        ])
        ->assertJsonPath('data.0.price', [
            'starts_on' => '2030-06-10',
            'ends_on' => '2030-06-12',
            'rental_days' => 2,
            'daily_rate_in_grosze' => 11100,
            'total_price_in_grosze' => 22200,
        ])
        ->assertJsonPath('data.0.is_available', true)
        ->assertJsonPath('data.0.alternative_dates', null);
    expect($response->json('data.*.id'))->toBe([$a->id, $b->id, $d->id]);
});

test('pagination keeps the filters in links', function () {
    Car::factory()->count(config('rental.cars_per_page') + 1)->create(['transmission' => Transmission::Manual]);
    Car::factory()->create(['transmission' => Transmission::Automatic]);

    $response = $this->getJson('/api/cars?transmission=manual&page=2');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.last_page', 2);
    expect($response->json('links.prev'))->toContain('transmission=manual');
});

test('invalid rental dates are rejected', function (string $query, string $field) {
    $response = $this->getJson("/api/cars?{$query}");

    $response->assertUnprocessable()->assertJsonValidationErrors([$field]);
    expect(array_keys($response->json('errors')))->toBe([$field]);
})->with([
    'missing return' => ['starts_on=2030-06-10', 'ends_on'],
    'missing pickup' => ['ends_on=2030-06-12', 'starts_on'],
    'pickup today' => ['starts_on=2030-06-01&ends_on=2030-06-03', 'starts_on'],
    'pickup in the past' => ['starts_on=2030-05-20&ends_on=2030-05-22', 'starts_on'],
    'pickup beyond horizon' => ['starts_on=2030-11-29&ends_on=2030-11-30', 'starts_on'],
    'return equal to pickup' => ['starts_on=2030-06-10&ends_on=2030-06-10', 'ends_on'],
    'rental longer than 30 days' => ['starts_on=2030-06-10&ends_on=2030-07-11', 'ends_on'],
    'unknown transmission' => ['transmission=hover', 'transmission'],
]);

test('boundary rental dates are accepted', function (string $query, ?int $rentalDays) {
    Car::factory()->create();

    $response = $this->getJson("/api/cars?{$query}");

    $response->assertOk();
    if ($rentalDays !== null) {
        $response->assertJsonPath('data.0.price.rental_days', $rentalDays);
    }
})->with([
    'tomorrow' => ['starts_on=2030-06-02&ends_on=2030-06-03', null],
    'last day of horizon' => ['starts_on=2030-11-28&ends_on=2030-11-29', null],
    'exactly 30 days' => ['starts_on=2030-06-10&ends_on=2030-07-10', 30],
]);

test('tomorrow is computed in Warsaw, not UTC', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 22:30:00 UTC'));

    $this->getJson('/api/cars?starts_on=2030-06-02&ends_on=2030-06-04')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['starts_on']);
    $this->getJson('/api/cars?starts_on=2030-06-03&ends_on=2030-06-05')->assertOk();
});
