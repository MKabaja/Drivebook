import { formatPrice } from '@/shared/lib/format-price';
import type { BookingFailure } from '@/features/bookings/lib/to-booking-failure';
import type { RentalPrice } from '@/features/cars/model/car.schemas';

type CheckoutFailure =
	| BookingFailure
	| { kind: 'payment-declined'; message: string };

const NO_CHARGE = 'No charge was made.';

/**
 * Message shown above the pay button. Every failure except `unconfirmed` states that no charge was
 * made. After a 409 `price` must already be the refreshed quote, because the message states the new total.
 */
function describeCheckoutFailure(
	failure: CheckoutFailure,
	price: RentalPrice,
): string {
	if (failure.kind === 'unconfirmed') {
		return "We couldn't confirm your booking. Check My bookings before you try again.";
	}
	if (failure.kind === 'signed-out') {
		return `Your session has expired. Sign in again to finish booking. ${NO_CHARGE}`;
	}
	if (failure.kind === 'price-changed') {
		return `The daily rate has changed. The new total is ${formatPrice(price.total_price_in_grosze)}. ${NO_CHARGE}`;
	}
	return `${failure.message} ${NO_CHARGE}`;
}

export type { CheckoutFailure };
export { describeCheckoutFailure };
