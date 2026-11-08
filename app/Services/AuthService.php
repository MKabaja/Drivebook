<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\SessionGuard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

final class AuthService
{
    public function register(string $name, string $email, #[\SensitiveParameter] string $password): User
    {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);
    }

    /** @throws ValidationException when the email or password is wrong */
    public function authenticate(string $email, #[\SensitiveParameter] string $password): User
    {
        $credentials = ['email' => $email, 'password' => $password];
        /** @var SessionGuard $guard */
        $guard = Auth::guard('web');
        $isValid = $guard->validate($credentials);
        $user = $guard->getLastAttempted();

        if (! $isValid || ! $user instanceof User) {
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $guard->getProvider()->rehashPasswordIfRequired($user, $credentials);

        return $user;
    }
}
