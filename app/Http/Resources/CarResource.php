<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\CarViewData;
use App\DataTransferObjects\RentalAvailability;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

class CarResource extends JsonResource
{
    public function __construct(private readonly CarViewData $view)
    {
        parent::__construct($view);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $carFields = $this->carFields($this->view->car);
        $rentalAvailability = $this->view->rentalAvailability;

        if ($rentalAvailability === null) {
            return $carFields;
        }

        return [...$carFields, ...$this->rentalFields($rentalAvailability)];
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     seats: int,
     *     transmission: string,
     *     category: string,
     *     daily_rate_in_grosze: int,
     *     image_url: string,
     *     image_srcset: string,
     * }
     */
    private function carFields(Car $car): array
    {
        return [
            'id' => $car->id,
            'name' => $car->name,
            'seats' => $car->seats,
            'transmission' => $car->transmission->value,
            'category' => $car->category->value,
            'daily_rate_in_grosze' => $car->daily_rate_in_grosze,
            ...$this->imageFields($car),
        ];
    }

    /** @return array{image_url: string, image_srcset: string} */
    private function imageFields(Car $car): array
    {
        /** @var non-empty-list<int> $widthsInPixels */
        $widthsInPixels = Config::array('rental.car_image_widths');
        $srcsetEntries = array_map(
            fn (int $widthInPixels): string => $this->imageUrl($car, $widthInPixels)." {$widthInPixels}w",
            $widthsInPixels,
        );

        return [
            'image_url' => $this->imageUrl($car, max($widthsInPixels)),
            'image_srcset' => implode(', ', $srcsetEntries),
        ];
    }

    private function imageUrl(Car $car, int $widthInPixels): string
    {
        return Storage::disk('public')->url("{$car->image_path}-{$widthInPixels}.webp");
    }

    /**
     * @return array{
     *     price: array{
     *         starts_on: string,
     *         ends_on: string,
     *         rental_days: int,
     *         daily_rate_in_grosze: int,
     *         total_price_in_grosze: int,
     *     },
     *     is_available: bool,
     *     alternative_dates: array{
     *         starts_on: string,
     *         ends_on: string,
     *         rental_days: int,
     *         daily_rate_in_grosze: int,
     *         total_price_in_grosze: int,
     *     }|null,
     * }
     */
    private function rentalFields(RentalAvailability $rentalAvailability): array
    {
        return [
            'price' => $rentalAvailability->requestedPrice->toArray(),
            'is_available' => $rentalAvailability->isAvailable,
            'alternative_dates' => $rentalAvailability->alternativePrice?->toArray(),
        ];
    }
}
