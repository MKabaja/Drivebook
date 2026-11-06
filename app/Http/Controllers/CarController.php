<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\RentalDates;
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
        $search = SearchCarsData::fromRequest($request);
        $matchingCars = $this->carService->search($search);

        return CarResource::collection($matchingCars);
    }

    public function show(ShowCarRequest $request, Car $car): CarResource
    {
        $requestedDates = RentalDates::fromRequest($request);
        $carDetails = $this->carService->details($car, $requestedDates);

        return new CarResource($carDetails);
    }
}
