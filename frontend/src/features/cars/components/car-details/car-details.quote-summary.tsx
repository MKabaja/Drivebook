import type { Ref } from 'react';

import { formatCalendarDate } from '@/shared/lib/format-calendar-date';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import type { RentalPrice } from '@/features/cars/model/car.schemas';

import { carDetailsStyles } from './car-details.styles';

type CarDetailsQuoteSummaryProps = {
	ref: Ref<HTMLElement>;
	price: RentalPrice;
	isAvailable: boolean;
};

function CarDetailsQuoteSummary({
	ref,
	price,
	isAvailable,
}: CarDetailsQuoteSummaryProps) {
	const { quote, quoteRow, quoteTerm, quoteTotal, available, unavailable } =
		carDetailsStyles;

	return (
		<section ref={ref} tabIndex={-1} aria-label="Price for your dates">
			<dl className={quote}>
				<div className={quoteRow}>
					<dt className={quoteTerm}>Dates</dt>
					<dd>
						<time dateTime={price.starts_on}>
							{formatCalendarDate(price.starts_on)}
						</time>{' '}
						–{' '}
						<time dateTime={price.ends_on}>
							{formatCalendarDate(price.ends_on)}
						</time>
					</dd>
				</div>
				<div className={quoteRow}>
					<dt className={quoteTerm}>Rental</dt>
					<dd>
						{formatDayCount(price.rental_days)} ×{' '}
						{formatPrice(price.daily_rate_in_grosze)}
					</dd>
				</div>
				<div className={`${quoteRow} ${quoteTotal}`}>
					<dt>Total</dt>
					<dd>{formatPrice(price.total_price_in_grosze)}</dd>
				</div>
			</dl>
			{isAvailable ? (
				<p className={available}>This car is free on these dates.</p>
			) : (
				<p className={unavailable}>
					This car is already booked on these dates.
				</p>
			)}
		</section>
	);
}

export { CarDetailsQuoteSummary };
