<?php

declare(strict_types=1);

namespace App\Services\Cars;

use App\DataTransferObjects\RentalDates;
use Carbon\CarbonImmutable;

final class AlternativeDatesFinder
{
    /**
     * @param  list<RentalDates>  $bookedDates  in any order
     * @param  CarbonImmutable  $latestPickupDate  inclusive
     * @return RentalDates|null `null` when nothing free starts by `$latestPickupDate`
     */
    public function findEarliestFreeDates(
        RentalDates $requestedDates,
        array $bookedDates,
        CarbonImmutable $latestPickupDate,
    ): ?RentalDates {
        $rentalDays = $requestedDates->rentalDays();
        $candidatePickupDate = $requestedDates->startsOn->addDay();

        foreach ($this->sortedByPickupDate($bookedDates) as $bookingDates) {
            $bookingEndsBeforeCandidate = $bookingDates->endsOn->lessThanOrEqualTo($candidatePickupDate);

            if ($bookingEndsBeforeCandidate) {
                continue;
            }

            $candidateReturnDate = $candidatePickupDate->addDays($rentalDays);
            $candidateFitsBeforeBooking = $candidateReturnDate->lessThanOrEqualTo($bookingDates->startsOn);

            if ($candidateFitsBeforeBooking) {
                break;
            }

            $candidatePickupDate = $bookingDates->endsOn;
        }

        if ($candidatePickupDate->isAfter($latestPickupDate)) {
            return null;
        }

        return new RentalDates($candidatePickupDate, $candidatePickupDate->addDays($rentalDays));
    }

    /**
     * @param  list<RentalDates>  $bookedDates
     * @return list<RentalDates>
     */
    private function sortedByPickupDate(array $bookedDates): array
    {
        usort(
            $bookedDates,
            fn (RentalDates $first, RentalDates $second): int => $first->startsOn <=> $second->startsOn,
        );

        return $bookedDates;
    }
}
