<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\CarViewData;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Config;

/** @mixin Booking */
class BookingResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'car_id' => $this->car_id,
            'starts_on' => $this->starts_on->toDateString(),
            'ends_on' => $this->ends_on->toDateString(),
            'status' => $this->status->value,
            'daily_rate_in_grosze' => $this->daily_rate_in_grosze,
            'total_price_in_grosze' => $this->total_price_in_grosze,
            'rental_days' => $this->rentalDays(),
            'can_cancel' => $this->canCancel(CarbonImmutable::now(Config::string('rental.timezone'))),
            'created_at' => $this->created_at->toISOString(),
            'car' => $this->whenLoaded('car', fn (): CarResource => new CarResource(CarViewData::withoutPeriod($this->car))),
        ];
    }
}
