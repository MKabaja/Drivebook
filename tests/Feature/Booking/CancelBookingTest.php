<?php

declare(strict_types=1);

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('owner may cancel immediately before pickup', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-10 09:59:59 Europe/Warsaw'));
    $user = User::factory()->create();
    $booking = Booking::factory()->create(['user_id' => $user->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);

    $this->actingAs($user, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")
        ->assertOk()->assertJsonPath('data.status', 'cancelled');

    $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'cancelled']);
});

test('pickup time closes cancellation even for the owner', function (string $clock) {
    $this->travelTo(new DateTimeImmutable($clock));
    $user = User::factory()->create();
    $booking = Booking::factory()->create(['user_id' => $user->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);

    $this->actingAs($user, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")->assertUnprocessable();

    $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'confirmed']);
})->with([
    'exact pickup boundary' => ['2030-06-10 10:00:00 Europe/Warsaw'],
    'after pickup' => ['2030-06-10 10:00:01 Europe/Warsaw'],
]);

test('another user cannot cancel a rental', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
    $booking = Booking::factory()->create(['starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);

    $this->actingAs(User::factory()->create(), 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")->assertForbidden();

    $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'confirmed']);
});

test('a rental cannot be cancelled twice', function () {
    $this->travelTo(new DateTimeImmutable('2030-06-01 12:00:00 Europe/Warsaw'));
    $user = User::factory()->create();
    $booking = Booking::factory()->cancelled()->create(['user_id' => $user->id, 'starts_on' => '2030-06-10', 'ends_on' => '2030-06-12']);

    $this->actingAs($user, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")
        ->assertUnprocessable()->assertJsonValidationErrors(['status']);

    $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'cancelled']);
});
