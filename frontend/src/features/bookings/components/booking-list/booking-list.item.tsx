import { PICKUP_TIME } from '@/shared/config';
import { formatCalendarDate } from '@/shared/lib/format-calendar-date';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import { labelByBookingStatus } from '@/features/bookings/model/booking.constants';
import type { Booking } from '@/features/bookings/model/booking.schemas';

import { BookingListCancelControl } from './booking-list.cancel-control';
import { badgeByBookingStatus, bookingListStyles } from './booking-list.styles';

type BookingListItemProps = {
	booking: Booking;
	isCancelling: boolean;
	isLocked: boolean;
	onCancel: (booking: Booking) => void;
};
type CancellationPolicy = 'cancelled' | 'cancellable' | 'past-deadline';
type DescribePolicy = (booking: Booking) => string;
type DescriptionByPolicy = Record<CancellationPolicy, DescribePolicy>;

const descriptionByPolicy: DescriptionByPolicy = {
	cancelled: () => 'This booking was cancelled.',
	cancellable: (booking) =>
		`You can cancel until ${PICKUP_TIME} on ${formatCalendarDate(booking.starts_on)}.`,
	'past-deadline': () => 'The cancellation time for this booking has passed.',
};

function BookingListItem({
	booking,
	isCancelling,
	isLocked,
	onCancel,
}: BookingListItemProps) {
	const {
		card,
		image,
		header,
		titleRow,
		carName,
		badgeBase,
		dates,
		total,
		breakdown,
		footer,
		policy,
	} = bookingListStyles;
	const { car } = booking;

	return (
		<li>
			<article className={card} aria-labelledby={`booking-${booking.id}`}>
				<img
					className={image}
					src={car.image_url}
					srcSet={car.image_srcset}
					sizes="(min-width: 640px) 200px, 100vw"
					alt=""
					width="640"
					height="400"
					loading="lazy"
				/>
				<div>
					<div className={header}>
						<div>
							<div className={titleRow}>
								<h2 id={`booking-${booking.id}`} className={carName}>
									{car.name}
								</h2>
								<span
									className={`${badgeBase} ${badgeByBookingStatus[booking.status]}`}
								>
									{labelByBookingStatus[booking.status]}
								</span>
							</div>
							<p className={dates}>
								<time dateTime={booking.starts_on}>
									{formatCalendarDate(booking.starts_on)}
								</time>{' '}
								–{' '}
								<time dateTime={booking.ends_on}>
									{formatCalendarDate(booking.ends_on)}
								</time>
								, pick-up and return at {PICKUP_TIME}
							</p>
						</div>
						<p className={total}>
							{formatPrice(booking.total_price_in_grosze)}
							<span className={breakdown}>
								{formatDayCount(booking.rental_days)} ×{' '}
								{formatPrice(booking.daily_rate_in_grosze)}
							</span>
						</p>
					</div>
					<div className={footer}>
						<p className={policy}>
							{descriptionByPolicy[toCancellationPolicy(booking)](booking)}
						</p>
						{booking.can_cancel && (
							<BookingListCancelControl
								booking={booking}
								isCancelling={isCancelling}
								isLocked={isLocked}
								onCancel={onCancel}
							/>
						)}
					</div>
				</div>
			</article>
		</li>
	);
}

function toCancellationPolicy(booking: Booking): CancellationPolicy {
	if (booking.status === 'cancelled') {
		return 'cancelled';
	}
	return booking.can_cancel ? 'cancellable' : 'past-deadline';
}

export { BookingListItem };
