<?php

declare(strict_types=1);

namespace App\Services\Cars;

use App\DataTransferObjects\CarViewData;
use App\DataTransferObjects\RentalAvailability;
use App\DataTransferObjects\RentalDates;
use App\DataTransferObjects\RentalPrice;
use App\DataTransferObjects\SearchCarsData;
use App\Models\Booking;
use App\Models\Car;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Config;

final class CarService
{
    public function __construct(
        private readonly RentalPricing $pricing,
        private readonly RentalWindow $rentalWindow,
        private readonly AlternativeDatesFinder $alternativeDatesFinder,
    ) {}

    /** @return LengthAwarePaginator<int, CarViewData> */
    public function search(SearchCarsData $search): LengthAwarePaginator
    {
        $requestedDates = $search->dates;

        return $this->carsMatching($search)
            ->orderBy('id')
            ->paginate(Config::integer('rental.cars_per_page'), page: $search->page)
            ->withQueryString()
            ->through(fn (Car $availableCar): CarViewData => $this->searchResultFor($availableCar, $requestedDates));
    }

    public function details(Car $car, ?RentalDates $requestedDates): CarViewData
    {
        if ($requestedDates === null) {
            return CarViewData::withoutDates($car);
        }

        return CarViewData::forDates($car, $this->rentalAvailability($car, $requestedDates));
    }

    /** @return Builder<Car> */
    private function carsMatching(SearchCarsData $search): Builder
    {
        $cars = Car::query();

        if ($search->minimumSeats !== null) {
            $cars->withMinimumSeats($search->minimumSeats);
        }

        if ($search->transmission !== null) {
            $cars->withTransmission($search->transmission);
        }

        if ($search->dates !== null) {
            $cars->availableDuring($search->dates);
        }

        return $cars;
    }

    private function searchResultFor(Car $availableCar, ?RentalDates $requestedDates): CarViewData
    {
        if ($requestedDates === null) {
            return CarViewData::withoutDates($availableCar);
        }

        $requestedPrice = $this->priceFor($availableCar, $requestedDates);

        return CarViewData::forDates($availableCar, RentalAvailability::available($requestedPrice));
    }

    private function rentalAvailability(Car $car, RentalDates $requestedDates): RentalAvailability
    {
        $requestedPrice = $this->priceFor($car, $requestedDates);

        if (! $this->isBooked($car, $requestedDates)) {
            return RentalAvailability::available($requestedPrice);
        }

        $alternativeDates = $this->alternativeDatesFor($car, $requestedDates);
        $alternativePrice = $alternativeDates === null ? null : $this->priceFor($car, $alternativeDates);

        return RentalAvailability::unavailable($requestedPrice, $alternativePrice);
    }

    private function isBooked(Car $car, RentalDates $dates): bool
    {
        return $car->bookings()
            ->active()
            ->overlapping($dates->startsOn, $dates->endsOn)
            ->exists();
    }

    private function alternativeDatesFor(Car $car, RentalDates $requestedDates): ?RentalDates
    {
        $latestPickupDate = $this->latestAlternativePickupDate($requestedDates);
        $searchedDates = new RentalDates(
            $requestedDates->startsOn,
            $latestPickupDate->addDays($requestedDates->rentalDays()),
        );

        return $this->alternativeDatesFinder->findEarliestFreeDates(
            requestedDates: $requestedDates,
            bookedDates: $this->bookedDatesWithin($car, $searchedDates),
            latestPickupDate: $latestPickupDate,
        );
    }

    private function latestAlternativePickupDate(RentalDates $requestedDates): CarbonImmutable
    {
        $windowInDays = Config::integer('rental.alternative_dates_window_days');
        $endOfAlternativeWindow = $requestedDates->startsOn->addDays($windowInDays);

        return $endOfAlternativeWindow->min($this->rentalWindow->latestPickupDate());
    }

    /** @return list<RentalDates> */
    private function bookedDatesWithin(Car $car, RentalDates $searchedDates): array
    {
        return $car->bookings()
            ->active()
            ->overlapping($searchedDates->startsOn, $searchedDates->endsOn)
            ->get(['starts_on', 'ends_on'])
            ->map(fn (Booking $booking): RentalDates => RentalDates::fromDateStrings(
                $booking->starts_on->toDateString(),
                $booking->ends_on->toDateString(),
            ))
            ->all();
    }

    private function priceFor(Car $car, RentalDates $dates): RentalPrice
    {
        return $this->pricing->priceFor($dates, $car->daily_rate_in_grosze);
    }
}
