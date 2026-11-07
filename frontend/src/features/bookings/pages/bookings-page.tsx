import { Link } from '@tanstack/react-router';

import { uiStyles } from '@/shared/components/ui.styles';
import type { BookingPage } from '@/features/bookings/api/bookings.api';
import { BookingList } from '@/features/bookings/components/booking-list/booking-list';

type BookingsPageProps = { bookingPage: BookingPage };

function BookingsPage({ bookingPage }: BookingsPageProps) {
	const { shell, page, eyebrow, title, lead, secondary } = uiStyles;

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
			<BookingList bookingPage={bookingPage} />
		</main>
	);
}

export { BookingsPage };
