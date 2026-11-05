<?php

declare(strict_types=1);

namespace App\Services\Cars;

use App\DataTransferObjects\CarViewData;
use App\DataTransferObjects\RentalPeriod;
use App\DataTransferObjects\RentalQuote;
use App\DataTransferObjects\SearchCarsData;
use App\Models\Car;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Config;

final class CarService
{
    public function __construct(private readonly RentalPricing $pricing) {}

    /** @return LengthAwarePaginator<int, CarViewData> */
    public function search(SearchCarsData $search): LengthAwarePaginator
    {
        $period = $search->period;

        return Car::query()
            ->when($search->minimumSeats !== null, fn (Builder $cars) => $cars->where('seats', '>=', $search->minimumSeats))
            ->when($search->transmission !== null, fn (Builder $cars) => $cars->where('transmission', $search->transmission))
            ->when($period !== null, fn (Builder $cars) => $cars->whereDoesntHave(
                'bookings',
                fn (Builder $bookings) => $bookings->active()->overlapping($period->startsOn, $period->endsOn),
            ))
            ->orderBy('id')
            ->paginate(Config::integer('rental.cars_per_page'), page: $search->page)
            ->withQueryString()
            ->through(fn (Car $car): CarViewData => $period === null
                ? CarViewData::withoutPeriod($car)
                : CarViewData::forPeriod($car, $this->quote($car, $period), isAvailable: true));
    }

    public function details(Car $car, ?RentalPeriod $period): CarViewData
    {
        if ($period === null) {
            return CarViewData::withoutPeriod($car);
        }

        $isAvailable = $car->bookings()->active()->overlapping($period->startsOn, $period->endsOn)->doesntExist();

        return CarViewData::forPeriod($car, $this->quote($car, $period), $isAvailable);
    }

    private function quote(Car $car, RentalPeriod $period): RentalQuote
    {
        return $this->pricing->quote($period->startsOn, $period->endsOn, $car->daily_rate_in_grosze);
    }
}
