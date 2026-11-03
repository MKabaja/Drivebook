<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Booking\BookingValidationPipeline;
use App\Services\Booking\Validators\AvailabilityValidator;
use App\Services\Booking\Validators\DateOrderValidator;
use App\Services\Booking\Validators\FutureDateValidator;
use App\Services\Booking\Validators\RoomCapacityValidator;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(BookingValidationPipeline::class, function ($app) {
            return new BookingValidationPipeline([
                new DateOrderValidator,
                new FutureDateValidator,
                new RoomCapacityValidator,
                new AvailabilityValidator,
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            $email = $request->input('email');
            $email = is_string($email) ? Str::lower($email) : '';

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('register', function (Request $request): Limit {
            return Limit::perMinute(3)->by((string) $request->ip());
        });
    }
}
