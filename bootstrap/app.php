<?php

declare(strict_types=1);

use App\Exceptions\DailyRateChanged;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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

        $exceptions->render(function (NotFoundHttpException $exception): ?JsonResponse {
            $missingModel = $exception->getPrevious();

            if (! $missingModel instanceof ModelNotFoundException) {
                return null;
            }

            return new JsonResponse(
                ['message' => class_basename($missingModel->getModel()).' not found.'],
                JsonResponse::HTTP_NOT_FOUND,
            );
        });
    })->create();
