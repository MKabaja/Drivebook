import { Link } from '@tanstack/react-router';

import { uiStyles } from '@/shared/styles/ui.styles';
import type { BookingPage } from '@/features/bookings/api/bookings.api';
import { BookingList } from '@/features/bookings/components/booking-list/booking-list';

import { bookingsPageStyles } from './bookings-page.styles';

type BookingsPageProps = { bookingPage: BookingPage; isJustBooked: boolean };

function BookingsPage({ bookingPage, isJustBooked }: BookingsPageProps) {
	const { shell, page, eyebrow, title, lead, secondary } = uiStyles;
	const { confirmation } = bookingsPageStyles;

	return (
		<main id="main" tabIndex={-1} className={`${shell} ${page}`}>
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div>
					<p className={eyebrow}>Your trips</p>
					<h1 className={title}>My bookings</h1>
					<p className={lead}>
						Newest first. Pick-up and return at the same place, in Warsaw time.
					</p>
				</div>
				<Link to="/cars" className={secondary}>
					Find another car
				</Link>
			</div>
			{isJustBooked && (
				<p className={confirmation} role="status">
					Booking confirmed. The demo payment was approved — no real money was
					charged.
				</p>
			)}
			<BookingList bookingPage={bookingPage} />
		</main>
	);
}

export { BookingsPage };
