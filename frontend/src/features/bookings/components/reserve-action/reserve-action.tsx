import {
	Link,
	useLocation,
	useRouteContext,
	useRouter,
} from '@tanstack/react-router';
import { CalendarCheck, LogIn } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { uiStyles } from '@/shared/styles/ui.styles';
import { createBooking } from '@/features/bookings/api/bookings.api';
import { describeReserveFailure } from '@/features/bookings/lib/describe-reserve-failure';
import {
	type BookingFailure,
	toBookingFailure,
} from '@/features/bookings/lib/to-booking-failure';
import type { RentalPrice } from '@/features/cars/model/car.schemas';

import { reserveActionStyles } from './reserve-action.styles';

type ReserveActionProps = {
	carId: number;
	price: RentalPrice;
	focusPriceSummary: () => void;
};
type ReserveStatus =
	| { status: 'idle' }
	| { status: 'submitting' }
	| { status: 'refreshing-price'; sentDailyRateInGrosze: number }
	| { status: 'failed'; failure: BookingFailure };
type ReserveState = { datesKey: string } & ReserveStatus;
function ReserveAction({
	carId,
	price,
	focusPriceSummary,
}: ReserveActionProps) {
	const { primary, alert } = uiStyles;
	const { action, hint } = reserveActionStyles;
	const router = useRouter();
	const { user, session } = useRouteContext({ from: '__root__' });
	const returnTo = useLocation({ select: (location) => location.href });
	const signInRef = useRef<HTMLAnchorElement>(null);
	const datesKey = `${carId}/${price.starts_on}/${price.ends_on}`;
	const [reserveState, setReserveState] = useState<ReserveState>({
		datesKey,
		status: 'idle',
	});
	const current = toCurrentStatus(reserveState, datesKey, price);
	const failure = current.status === 'failed' ? current.failure : undefined;
	const isBusy =
		current.status === 'submitting' || current.status === 'refreshing-price';

	async function handleReserve() {
		if (isBusy) {
			return;
		}
		const sentDailyRateInGrosze = price.daily_rate_in_grosze;
		setReserveState({ datesKey, status: 'submitting' });
		try {
			await createBooking({
				car_id: carId,
				starts_on: price.starts_on,
				ends_on: price.ends_on,
				expected_daily_rate_in_grosze: sentDailyRateInGrosze,
			});
			await router.navigate({ to: '/bookings' });
		} catch (error) {
			await handleFailure(toBookingFailure(error), sentDailyRateInGrosze);
		}
	}

	async function handleFailure(
		nextFailure: BookingFailure,
		sentDailyRateInGrosze: number,
	) {
		const failedState: ReserveState = {
			datesKey,
			status: 'failed',
			failure: nextFailure,
		};
		if (nextFailure.kind === 'signed-out') {
			flushSync(() => setReserveState(failedState));
			signInRef.current?.focus();
			session.setUser(null);
			await router.invalidate();
			return;
		}
		if (nextFailure.kind === 'price-changed') {
			setReserveState({
				datesKey,
				status: 'refreshing-price',
				sentDailyRateInGrosze,
			});
			focusPriceSummary();
			await router.invalidate();
			return;
		}
		if (nextFailure.kind === 'rejected') {
			setReserveState(failedState);
			focusPriceSummary();
			await router.invalidate();
			return;
		}
		setReserveState(failedState);
	}

	return (
		<div className={action}>
			{failure && (
				<p className={alert} role="alert">
					{describeReserveFailure(failure, price)}
				</p>
			)}
			{user && failure?.kind !== 'signed-out' ? (
				<button
					type="button"
					onClick={handleReserve}
					disabled={isBusy}
					className={primary}
				>
					<CalendarCheck size={18} aria-hidden="true" />
					{reserveLabel(current)}
				</button>
			) : (
				<Link
					ref={signInRef}
					to="/login"
					search={{ redirect: returnTo }}
					className={primary}
				>
					<LogIn size={18} aria-hidden="true" />
					Sign in to book
				</Link>
			)}
			<p className={hint}>You can cancel until pick-up time.</p>
		</div>
	);
}

function toCurrentStatus(
	reserveState: ReserveState,
	datesKey: string,
	price: RentalPrice,
): ReserveStatus {
	if (reserveState.status === 'submitting') {
		return reserveState;
	}
	if (reserveState.datesKey !== datesKey) {
		return { status: 'idle' };
	}
	if (
		reserveState.status === 'refreshing-price' &&
		reserveState.sentDailyRateInGrosze !== price.daily_rate_in_grosze
	) {
		return { status: 'failed', failure: { kind: 'price-changed' } };
	}
	return reserveState;
}

function reserveLabel(current: ReserveStatus): string {
	if (
		current.status === 'submitting' ||
		current.status === 'refreshing-price'
	) {
		return 'Booking…';
	}
	if (current.status === 'failed' && current.failure.kind === 'price-changed') {
		return 'Confirm new price and book';
	}
	return 'Book this car';
}

export { ReserveAction };
