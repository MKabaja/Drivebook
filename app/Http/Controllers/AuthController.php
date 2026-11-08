<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): UserResource
    {
        $payload = $request->safe();
        $user = $this->authService->register(
            $payload->string('name')->toString(),
            $payload->string('email')->toString(),
            $payload->string('password')->toString(),
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return new UserResource($user);
    }

    public function login(LoginRequest $request): UserResource
    {
        $payload = $request->safe();
        $user = $this->authService->authenticate(
            $payload->string('email')->toString(),
            $payload->string('password')->toString(),
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return new UserResource($user);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
