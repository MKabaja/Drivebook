import { formatPrice } from '@/shared/lib/format-price';
import type { BookingFailure } from '@/features/bookings/lib/to-booking-failure';
import type { RentalPrice } from '@/features/cars/model/car.schemas';

type FixedMessageKind = Exclude<
	BookingFailure['kind'],
	'price-changed' | 'rejected' | 'general'
>;
type MessageByFailureKind = Record<FixedMessageKind, string>;

const messageByFailureKind: MessageByFailureKind = {
	'signed-out': 'Your session has expired. Sign in to book these dates.',
	unconfirmed:
		"We couldn't confirm your booking. Check My bookings before you try again.",
};

/**
 * Message shown next to the booking button. After a 409 `price` must already be the refreshed
 * quote, because the message states the new total.
 */
function describeReserveFailure(
	failure: BookingFailure,
	price: RentalPrice,
): string {
	if ('message' in failure) {
		return failure.message;
	}
	if (failure.kind === 'price-changed') {
		return `The daily rate has changed. The new total is ${formatPrice(price.total_price_in_grosze)} — confirm to book at this price.`;
	}
	return messageByFailureKind[failure.kind];
}

export { describeReserveFailure };
