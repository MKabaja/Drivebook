<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;

use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)->group(function () {
    Route::post('/register', 'register')->middleware('throttle:register');
    Route::post('/login', 'login')->middleware('throttle:login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::controller(BookingController::class)->group(function () {
        Route::get('/bookings', 'index');
        Route::post('/bookings', 'store');
        Route::patch('/bookings/{booking}/cancel', 'cancel');
    });
});
