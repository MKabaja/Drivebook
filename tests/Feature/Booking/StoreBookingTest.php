<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function rentalPayload(Car $car, array $overrides = []): array
{
    return array_replace([
        'car_id' => $car->id,
        'starts_on' => '2030-06-10',
        'ends_on' => '2030-06-12',
        'expected_daily_rate_in_grosze' => $car->daily_rate_in_grosze,
    ], $overrides);
}

beforeEach(function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
});

test('booking confirms the selected car with an integer price snapshot', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['daily_rate_in_grosze' => 15999]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', rentalPayload($car));

    $response->assertCreated()
        ->assertJsonPath('data.car_id', $car->id)
        ->assertJsonPath('data.status', 'confirmed')
        ->assertJsonPath('data.can_cancel', true)
        ->assertJsonPath('data.starts_on', '2030-06-10')
        ->assertJsonPath('data.ends_on', '2030-06-12')
        ->assertJsonPath('data.daily_rate_in_grosze', 15999)
        ->assertJsonPath('data.total_price_in_grosze', 31998);
    $this->assertDatabaseHas('bookings', [
        'id' => $response->json('data.id'),
        'user_id' => $user->id,
        'car_id' => $car->id,
        'status' => 'confirmed',
        'daily_rate_in_grosze' => 15999,
        'total_price_in_grosze' => 31998,
    ]);

    $car->update(['daily_rate_in_grosze' => 19999]);
    $this->getJson('/api/bookings')->assertOk()
        ->assertJsonPath('data.0.daily_rate_in_grosze', 15999)
        ->assertJsonPath('data.0.total_price_in_grosze', 31998);
});

test('a changed displayed rate requires a new quote and creates no booking', function () {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 20000]);

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['expected_daily_rate_in_grosze' => 15000]))
        ->assertConflict()
        ->assertJsonPath('message', 'The daily rate has changed. Please review the updated price.');

    $this->assertDatabaseCount('bookings', 0);
});

test('invalid rental date boundaries are rejected without saving', function (string $start, string $end, string $field) {
    $car = Car::factory()->create();

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]))
        ->assertUnprocessable()->assertJsonValidationErrors([$field]);

    $this->assertDatabaseCount('bookings', 0);
})->with([
    'same dates' => ['2030-06-10', '2030-06-10', 'ends_on'],
    'reversed dates' => ['2030-06-10', '2030-06-09', 'ends_on'],
    'today' => ['2030-06-01', '2030-06-02', 'starts_on'],
    'past' => ['2030-05-31', '2030-06-02', 'starts_on'],
]);

test('tomorrow is the earliest accepted pickup date', function () {
    $car = Car::factory()->create();

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => '2030-06-02', 'ends_on' => '2030-06-03']))
        ->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
});

test('overlapping confirmed rentals block the same car', function (string $start, string $end) {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-15']);

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]))
        ->assertUnprocessable()->assertJsonValidationErrors(['starts_on']);

    $this->assertDatabaseCount('bookings', 1);
})->with([
    'overlaps start' => ['2030-06-09', '2030-06-12'],
    'overlaps end' => ['2030-06-14', '2030-06-17'],
    'inside existing rental' => ['2030-06-11', '2030-06-14'],
    'covers existing rental' => ['2030-06-09', '2030-06-17'],
]);

test('touching dates allow the next rental', function (string $start, string $end) {
    $car = Car::factory()->create();
    Booking::factory()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-15']);

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]))
        ->assertCreated();

    $this->assertDatabaseCount('bookings', 2);
})->with([
    'ends at existing pickup' => ['2030-06-08', '2030-06-10'],
    'starts at existing return' => ['2030-06-15', '2030-06-17'],
]);

test('cancelled rentals and another car do not block a new booking', function () {
    $car = Car::factory()->create();
    Booking::factory()->cancelled()->create(['car_id' => $car->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);
    Booking::factory()->create(['starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);

    $this->actingAs(User::factory()->create(), 'sanctum')->postJson('/api/bookings', rentalPayload($car))->assertCreated();

    $this->assertDatabaseCount('bookings', 3);
});

test('pricing counts calendar days through a daylight saving transition', function () {
    $this->travelTo(new DateTimeImmutable('2030-03-01 12:00:00 Europe/Warsaw'));
    $car = Car::factory()->create(['daily_rate_in_grosze' => 12900]);

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => '2030-03-30', 'ends_on' => '2030-04-01']))
        ->assertCreated()->assertJsonPath('data.total_price_in_grosze', 25800);
});

test('tomorrow follows the Warsaw calendar late in the UTC evening', function (string $start, string $end, bool $accepted) {
    $this->travelTo(new DateTimeImmutable('2030-06-01 22:30:00 UTC'));
    $car = Car::factory()->create();

    $response = $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]));

    if ($accepted) {
        $response->assertCreated();
        $this->assertDatabaseCount('bookings', 1);
    } else {
        $response->assertUnprocessable()->assertJsonValidationErrors(['starts_on']);
        $this->assertDatabaseCount('bookings', 0);
    }
})->with([
    'Warsaw today' => ['2030-06-02', '2030-06-04', false],
    'Warsaw tomorrow' => ['2030-06-03', '2030-06-05', true],
]);

test('rental length is limited to the configured maximum', function (string $start, string $end, bool $accepted) {
    $car = Car::factory()->create(['daily_rate_in_grosze' => 15000]);

    $response = $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]));

    if ($accepted) {
        $response->assertCreated()->assertJsonPath('data.total_price_in_grosze', 30 * 15000);
        $this->assertDatabaseCount('bookings', 1);
    } else {
        $response->assertUnprocessable()->assertJsonValidationErrors(['ends_on']);
        $this->assertDatabaseCount('bookings', 0);
    }
})->with([
    '30 days' => ['2030-06-10', '2030-07-10', true],
    '31 days' => ['2030-06-10', '2030-07-11', false],
]);

test('pickup must fall within the booking horizon', function (string $start, string $end, bool $accepted) {
    $car = Car::factory()->create();

    $response = $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['starts_on' => $start, 'ends_on' => $end]));

    if ($accepted) {
        $response->assertCreated();
        $this->assertDatabaseCount('bookings', 1);
    } else {
        $response->assertUnprocessable()->assertJsonValidationErrors(['starts_on']);
        $this->assertDatabaseCount('bookings', 0);
    }
})->with([
    'last day of the horizon' => ['2030-11-28', '2030-11-30', true],
    'one day past the horizon' => ['2030-11-29', '2030-12-01', false],
]);

test('an unknown car is rejected as a validation error', function () {
    $car = Car::factory()->create();

    $this->actingAs(User::factory()->create(), 'sanctum')
        ->postJson('/api/bookings', rentalPayload($car, ['car_id' => Car::query()->max('id') + 1000]))
        ->assertUnprocessable()->assertJsonValidationErrors(['car_id']);

    $this->assertDatabaseCount('bookings', 0);
});
