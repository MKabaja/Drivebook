<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\DataTransferObjects\CarViewData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    public function __construct(private readonly CarViewData $view)
    {
        parent::__construct($view);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $car = $this->view->car;

        return [
            'id' => $car->id,
            'name' => $car->name,
            'seats' => $car->seats,
            'transmission' => $car->transmission->value,
            'daily_rate_in_grosze' => $car->daily_rate_in_grosze,
            'image_path' => $car->image_path,
            'quote' => $this->view->quote?->toArray(),
            'availability' => $this->view->availability,
            'alternative_dates' => $this->view->alternativeDates?->toArray(),
        ];
    }
}
