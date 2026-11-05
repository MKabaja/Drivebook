<?php

declare(strict_types=1);

use App\Exceptions\DailyRateChanged;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(fn (DailyRateChanged $exception): JsonResponse => new JsonResponse(
            ['message' => $exception->getMessage()],
            JsonResponse::HTTP_CONFLICT,
        ));
    })->create();
