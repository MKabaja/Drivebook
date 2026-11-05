<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookingData;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\Booking\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookingService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return BookingResource::collection($this->bookingService->getForUser($request->user()));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $bookingData = BookingData::fromRequest($request, $request->user()->id);

        return (new BookingResource($this->bookingService->store($bookingData)))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function cancel(Booking $booking): BookingResource
    {
        $this->authorize('cancel', $booking);

        return new BookingResource($this->bookingService->cancel($booking));
    }
}
