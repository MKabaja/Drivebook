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
        $userBookings = $this->bookingService->getForUser($request->user());

        return BookingResource::collection($userBookings);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $bookingData = BookingData::fromRequest($request, $request->user()->id);

        $booking = $this->bookingService->store($bookingData);

        return (new BookingResource($booking))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function cancel(Booking $booking): BookingResource
    {
        $this->authorize('cancel', $booking);

        $cancelledBooking = $this->bookingService->cancel($booking);

        return new BookingResource($cancelledBooking);
    }
}
