<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withHeader('Origin', 'http://localhost:5174');
});

test('registration starts a session and returns only public user fields', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Jan Kowalski',
        'email' => 'jan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::query()->where('email', 'jan@example.com')->sole();

    $response->assertCreated()->assertExactJson([
        'data' => ['id' => $user->id, 'name' => 'Jan Kowalski', 'email' => 'jan@example.com'],
    ]);
    $this->assertAuthenticatedAs($user, 'web');
    expect(Hash::check('password123', $user->password))->toBeTrue();
});

test('invalid registration returns the validation contract without creating an account', function () {
    $this->postJson('/api/register', [
        'name' => 'Jan Kowalski',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

    $this->assertDatabaseCount('users', 0);
});

test('duplicate email cannot create a second account', function () {
    $user = User::factory()->create();

    $this->postJson('/api/register', [
        'name' => 'Another user',
        'email' => $user->email,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

    $this->assertDatabaseCount('users', 1);
});

test('login starts a session and returns only public user fields', function () {
    $user = User::factory()->create();
    $this->withSession(['previous_session' => true]);
    $previousSessionId = session()->getId();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk()->assertExactJson([
        'data' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
    ]);

    $this->assertAuthenticatedAs($user, 'web');
    expect(session()->getId())->not->toBe($previousSessionId);
});

test('wrong credentials do not authenticate the user', function (string $email, string $password) {
    User::factory()->create(['email' => 'jan@example.com']);

    $this->postJson('/api/login', [
        'email' => $email,
        'password' => $password,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => 'These credentials do not match our records.'])
        ->assertJsonMissingValidationErrors(['password']);

    $this->assertGuest('web');
})->with([
    'wrong password' => ['jan@example.com', 'wrongpassword'],
    'unknown email' => ['unknown@example.com', 'password'],
]);

test('current user requires authentication', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

test('session cookies restore the user and logout invalidates the session', function () {
    config(['session.driver' => 'file']);
    $this->app->forgetInstance('session');
    $this->app->forgetInstance('session.store');
    Auth::forgetGuards();
    $user = User::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $cookies = [];
    foreach ($login->headers->getCookies() as $cookie) {
        $cookies[$cookie->getName()] = $cookie->getValue();
    }

    Auth::forgetGuards();
    $this->withUnencryptedCookies($cookies)->withCredentials()
        ->getJson('/api/user')->assertOk()->assertExactJson([
            'data' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
        ]);

    $this->postJson('/api/logout')->assertNoContent();
    $this->assertGuest('web');
    Auth::forgetGuards();
    $this->getJson('/api/user')->assertUnauthorized();
});

test('stateful login requires a valid csrf token when origin verification does not apply', function () {
    $this->app['env'] = 'local';
    $this->withHeader('Sec-Fetch-Site', 'cross-site');
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertStatus(419);

    $csrf = $this->get('/sanctum/csrf-cookie')->assertNoContent();
    $cookies = [];
    foreach ($csrf->headers->getCookies() as $cookie) {
        $cookies[$cookie->getName()] = $cookie->getValue();
    }

    $this->withUnencryptedCookies($cookies)->withCredentials()
        ->withHeader('X-XSRF-TOKEN', $cookies['XSRF-TOKEN'])
        ->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.id', $user->id);
});

test('login attempts are rate limited', function () {
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->postJson('/api/login', [
            'email' => 'unknown@example.com',
            'password' => 'wrongpassword',
        ])->assertUnprocessable();
    }

    $this->postJson('/api/login', [
        'email' => 'unknown@example.com',
        'password' => 'wrongpassword',
    ])->assertTooManyRequests();
});

test('registration attempts are rate limited', function () {
    for ($attempt = 0; $attempt < 3; $attempt++) {
        $this->postJson('/api/register')->assertUnprocessable();
    }

    $this->postJson('/api/register')->assertTooManyRequests();
});

test('bearer tokens are ignored by the session-only API', function () {
    $this->withHeader('Authorization', 'Bearer 1|abc')
        ->getJson('/api/user')
        ->assertUnauthorized();
});
