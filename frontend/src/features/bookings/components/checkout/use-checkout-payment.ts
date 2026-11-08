import { useRouteContext, useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { createBooking } from '@/features/bookings/api/bookings.api';
import {
	type DemoCard,
	decideDemoPayment,
} from '@/features/bookings/lib/decide-demo-payment';
import type { CheckoutFailure } from '@/features/bookings/lib/describe-checkout-failure';
import { toBookingFailure } from '@/features/bookings/lib/to-booking-failure';
import { DEMO_PAYMENT_DELAY_MS } from '@/features/bookings/model/payment.constants';
import type { RentalPrice } from '@/features/cars/model/car.schemas';

type CheckoutStatus =
	| { status: 'idle' }
	| { status: 'paying' }
	| { status: 'booking' }
	| { status: 'refreshing-price'; sentDailyRateInGrosze: number }
	| { status: 'failed'; failure: CheckoutFailure };
type CheckoutPaymentOptions = {
	carId: number;
	price: RentalPrice;
	today: string;
	focusSummary: () => void;
	focusAccount: () => void;
	focusPayment: () => void;
};
type CheckoutPayment = {
	current: CheckoutStatus;
	pay: (card: DemoCard) => Promise<void>;
	clearFailure: () => void;
};

/**
 * Runs the demo payment, then one booking request (never retried). A 409 waits for the refreshed
 * quote before reporting the new price; a 401/419 signs the user out so the page offers sign-in again.
 * Leaving the page during the simulated payment sends no booking.
 */
function useCheckoutPayment({
	carId,
	price,
	today,
	focusSummary,
	focusAccount,
	focusPayment,
}: CheckoutPaymentOptions): CheckoutPayment {
	const router = useRouter();
	const { user, session } = useRouteContext({ from: '__root__' });
	const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>({
		status: 'idle',
	});
	const isMountedRef = useRef(false);
	const current = toCurrentStatus(checkoutStatus, price);
	const isBusy = current.status !== 'idle' && current.status !== 'failed';

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	async function pay(card: DemoCard) {
		if (isBusy || user === null) {
			return;
		}
		const sentDailyRateInGrosze = price.daily_rate_in_grosze;
		setCheckoutStatus({ status: 'paying' });
		await waitFor(DEMO_PAYMENT_DELAY_MS);
		if (!isMountedRef.current) {
			return;
		}
		const payment = decideDemoPayment(card, today);
		if (payment.outcome === 'declined') {
			setCheckoutStatus({
				status: 'failed',
				failure: { kind: 'payment-declined', message: payment.message },
			});
			return;
		}
		setCheckoutStatus({ status: 'booking' });
		try {
			const booking = await createBooking({
				car_id: carId,
				starts_on: price.starts_on,
				ends_on: price.ends_on,
				expected_daily_rate_in_grosze: sentDailyRateInGrosze,
			});
			await router.navigate({
				to: '/bookings',
				search: { booked: booking.id },
			});
		} catch (error) {
			await handleBookingFailure(error, sentDailyRateInGrosze);
		}
	}

	async function handleBookingFailure(
		error: unknown,
		sentDailyRateInGrosze: number,
	) {
		const failure = toBookingFailure(error);
		if (failure.kind === 'price-changed') {
			setCheckoutStatus({ status: 'refreshing-price', sentDailyRateInGrosze });
			focusSummary();
			await router.invalidate();
			return;
		}
		if (failure.kind === 'signed-out') {
			flushSync(() => setCheckoutStatus({ status: 'failed', failure }));
			focusAccount();
			session.setUser(null);
			await router.invalidate();
			return;
		}
		setCheckoutStatus({ status: 'failed', failure });
		if (failure.kind === 'rejected') {
			focusPayment();
			await router.invalidate();
		}
	}

	function clearFailure() {
		setCheckoutStatus({ status: 'idle' });
	}

	return { current, pay, clearFailure };
}

function toCurrentStatus(
	checkoutStatus: CheckoutStatus,
	price: RentalPrice,
): CheckoutStatus {
	if (
		checkoutStatus.status === 'refreshing-price' &&
		checkoutStatus.sentDailyRateInGrosze !== price.daily_rate_in_grosze
	) {
		return { status: 'failed', failure: { kind: 'price-changed' } };
	}
	return checkoutStatus;
}

function waitFor(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export type { CheckoutStatus };
export { useCheckoutPayment };
