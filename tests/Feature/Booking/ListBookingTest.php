<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('rental operations require an authenticated user', function () {
    $this->getJson('/api/bookings')->assertUnauthorized();
    $this->postJson('/api/bookings', [])->assertUnauthorized();

    $booking = Booking::factory()->create();
    $this->patchJson("/api/bookings/{$booking->id}/cancel")->assertUnauthorized();
    $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'confirmed']);
});

test('users see only their own rental history with resource pagination', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
    $user = User::factory()->create();
    $bookings = Booking::factory()->count(2)->create(['user_id' => $user->id]);
    Booking::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/bookings');

    $response->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 2)
        ->assertJsonStructure(['data' => [['id', 'car_id', 'car' => ['id', 'name'], 'starts_on', 'ends_on', 'status', 'daily_rate_in_grosze', 'total_price_in_grosze']], 'links', 'meta']);
    expect($response->json('data.*.id'))->toEqualCanonicalizing($bookings->modelKeys());
    expect($response->json('data.0'))->not->toHaveKey('user_id');
});

test('booked car is embedded without rental price fields', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
    $user = User::factory()->create();
    Booking::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/bookings');

    $response->assertOk();
    expect(array_keys($response->json('data.0.car')))
        ->toEqualCanonicalizing(['id', 'name', 'seats', 'transmission', 'category', 'daily_rate_in_grosze', 'image_url', 'image_srcset']);
});
