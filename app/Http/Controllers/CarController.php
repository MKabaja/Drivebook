<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\RentalPeriod;
use App\DataTransferObjects\SearchCarsData;
use App\Http\Requests\SearchCarsRequest;
use App\Http\Requests\ShowCarRequest;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Services\Cars\CarService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CarController extends Controller
{
    public function __construct(private readonly CarService $carService) {}

    public function index(SearchCarsRequest $request): AnonymousResourceCollection
    {
        return CarResource::collection($this->carService->search(SearchCarsData::fromRequest($request)));
    }

    public function show(ShowCarRequest $request, Car $car): CarResource
    {
        return new CarResource($this->carService->details($car, RentalPeriod::fromRequest($request)));
    }
}
