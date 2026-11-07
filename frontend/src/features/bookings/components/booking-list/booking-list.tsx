import {
	Link,
	useLocation,
	useRouteContext,
	useRouter,
} from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { uiStyles } from '@/shared/components/ui.styles';
import {
	type BookingPage,
	cancelBooking,
} from '@/features/bookings/api/bookings.api';
import {
	type BookingFailure,
	toBookingFailure,
} from '@/features/bookings/lib/to-booking-failure';
import type { Booking } from '@/features/bookings/model/booking.schemas';

import { BookingListItem } from './booking-list.item';
import { BookingListPagination } from './booking-list.pagination';
import { bookingListStyles } from './booking-list.styles';

type BookingListProps = { bookingPage: BookingPage };
type CancelState =
	| { status: 'idle' }
	| { status: 'cancelling'; bookingId: number }
	| { status: 'cancelled'; carName: string }
	| { status: 'failed'; message: string };

const GENERIC_MESSAGE =
	"We couldn't cancel this booking. Try again in a moment.";
const UNREACHABLE_MESSAGE =
	"We couldn't reach the server. Refresh the page to see the current status of your booking.";

function BookingList({ bookingPage }: BookingListProps) {
	const { empty, secondary, alert } = uiStyles;
	const { outcome, list, emptyTitle, emptyText, emptyAction } =
		bookingListStyles;
	const { bookings, pagination } = bookingPage;
	const router = useRouter();
	const session = useRouteContext({
		from: '__root__',
		select: (context) => context.session,
	});
	const currentHref = useLocation({ select: (location) => location.href });
	const outcomeRef = useRef<HTMLParagraphElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const [cancelState, setCancelState] = useState<CancelState>({
		status: 'idle',
	});
	const cancellingId =
		cancelState.status === 'cancelling' ? cancelState.bookingId : undefined;

	async function handleCancel(booking: Booking) {
		if (cancellingId !== undefined) {
			return;
		}
		setCancelState({ status: 'cancelling', bookingId: booking.id });
		try {
			await cancelBooking(booking.id);
			await router.invalidate();
			showOutcome({ status: 'cancelled', carName: booking.car.name });
		} catch (error) {
			await handleFailure(toBookingFailure(error));
		}
	}

	async function handleFailure(failure: BookingFailure) {
		if (failure.kind === 'signed-out') {
			session.setUser(null);
			await router.navigate({
				to: '/login',
				search: { redirect: currentHref },
			});
			return;
		}
		await router.invalidate();
		showOutcome({ status: 'failed', message: describeFailure(failure) });
	}

	function handlePageChange() {
		setCancelState({ status: 'idle' });
		headingRef.current?.focus();
	}

	function showOutcome(nextState: CancelState) {
		flushSync(() => setCancelState(nextState));
		outcomeRef.current?.focus();
	}

	if (bookings.length === 0) {
		return (
			<div className={empty}>
				<CalendarDays size={32} className="mx-auto mb-4" aria-hidden="true" />
				<h2 className={emptyTitle}>You have no bookings yet.</h2>
				<p className={emptyText}>Pick a car and plan your first trip.</p>
				<Link to="/cars" className={`${secondary} ${emptyAction}`}>
					Browse cars
				</Link>
			</div>
		);
	}

	return (
		<>
			<h2 ref={headingRef} tabIndex={-1} className="sr-only">
				Bookings
			</h2>
			<div className={outcome}>
				{cancelState.status === 'cancelled' && (
					<p ref={outcomeRef} tabIndex={-1} role="status">
						Your {cancelState.carName} booking has been cancelled.
					</p>
				)}
				{cancelState.status === 'failed' && (
					<p ref={outcomeRef} tabIndex={-1} role="alert" className={alert}>
						{cancelState.message}
					</p>
				)}
			</div>
			<ul className={list}>
				{bookings.map((booking) => (
					<BookingListItem
						key={booking.id}
						booking={booking}
						isCancelling={cancellingId === booking.id}
						isLocked={cancellingId !== undefined}
						onCancel={handleCancel}
					/>
				))}
			</ul>
			<BookingListPagination
				pagination={pagination}
				onNavigate={handlePageChange}
			/>
		</>
	);
}

function describeFailure(failure: BookingFailure): string {
	if ('message' in failure) {
		return failure.message;
	}
	if (failure.kind === 'unconfirmed') {
		return UNREACHABLE_MESSAGE;
	}
	return GENERIC_MESSAGE;
}

export { BookingList };
