<?php

declare(strict_types=1);

namespace App\Services\Booking;

use App\DataTransferObjects\BookingData;
use App\Enums\BookingStatus;
use App\Exceptions\DailyRateChanged;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use App\Services\Cars\RentalPricing;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class BookingService
{
    public function __construct(
        private readonly BookingValidationPipeline $validationPipeline,
        private readonly RentalPricing $pricing,
    ) {}

    public function store(BookingData $data): Booking
    {
        return DB::transaction(function () use ($data): Booking {
            $car = Car::query()->lockForUpdate()->findOrFail($data->carId);
            $this->validationPipeline->validate($data);

            if ($car->daily_rate_in_grosze !== $data->expectedDailyRateInGrosze) {
                throw new DailyRateChanged;
            }

            $quote = $this->pricing->quote($data->startsOn, $data->endsOn, $car->daily_rate_in_grosze);
            $booking = Booking::create([
                'car_id' => $car->id,
                'user_id' => $data->userId,
                'starts_on' => $data->startsOn->toDateString(),
                'ends_on' => $data->endsOn->toDateString(),
                'status' => BookingStatus::Confirmed,
                'daily_rate_in_grosze' => $quote->dailyRateInGrosze,
                'total_price_in_grosze' => $quote->totalPriceInGrosze,
            ]);

            return $booking->load('car');
        });
    }

    public function cancel(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking): Booking {
            Car::query()->lockForUpdate()->findOrFail($booking->car_id);
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->id);

            if ($lockedBooking->status === BookingStatus::Cancelled) {
                throw ValidationException::withMessages(['status' => 'Booking is already cancelled.']);
            }

            if (! $lockedBooking->canCancel(CarbonImmutable::now(Config::string('rental.timezone')))) {
                throw ValidationException::withMessages(['status' => 'Booking can only be cancelled before pickup.']);
            }

            $lockedBooking->update(['status' => BookingStatus::Cancelled]);

            return $lockedBooking->load('car');
        });
    }

    /** @return LengthAwarePaginator<int, Booking> */
    public function getForUser(User $user): LengthAwarePaginator
    {
        return $user->bookings()->with('car')->latest()->orderByDesc('id')->paginate(Config::integer('rental.bookings_per_page'))->withQueryString();
    }
}
