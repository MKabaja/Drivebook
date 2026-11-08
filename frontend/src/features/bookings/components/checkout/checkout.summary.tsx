import type { Ref } from 'react';

import { PICKUP_TIME } from '@/shared/config';
import { formatCalendarDate } from '@/shared/lib/format-calendar-date';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import { uiStyles } from '@/shared/styles/ui.styles';
import { labelByCategory } from '@/features/cars/model/car.constants';
import type { Car, RentalPrice } from '@/features/cars/model/car.schemas';

import { checkoutStyles } from './checkout.styles';

type CheckoutSummaryProps = {
	ref: Ref<HTMLElement>;
	car: Car;
	price: RentalPrice;
};

function CheckoutSummary({ ref, car, price }: CheckoutSummaryProps) {
	const { panel } = uiStyles;
	const {
		summary,
		summaryImage,
		summaryName,
		summaryCategory,
		rows,
		row,
		term,
		total,
		note,
	} = checkoutStyles;

	return (
		<aside
			ref={ref}
			tabIndex={-1}
			className={`${panel} ${summary}`}
			aria-label="Your rental"
		>
			<img
				className={summaryImage}
				src={car.image_url}
				srcSet={car.image_srcset}
				sizes="(min-width: 1024px) 400px, 100vw"
				alt=""
				width="640"
				height="400"
			/>
			<p className={summaryCategory}>{labelByCategory[car.category]}</p>
			<p className={summaryName}>{car.name}</p>
			<dl className={rows}>
				<div className={row}>
					<dt className={term}>Pick-up</dt>
					<dd>
						<time dateTime={price.starts_on}>
							{formatCalendarDate(price.starts_on)}
						</time>
						, {PICKUP_TIME}
					</dd>
				</div>
				<div className={row}>
					<dt className={term}>Return</dt>
					<dd>
						<time dateTime={price.ends_on}>
							{formatCalendarDate(price.ends_on)}
						</time>
						, {PICKUP_TIME}
					</dd>
				</div>
				<div className={row}>
					<dt className={term}>Rental</dt>
					<dd>
						{formatDayCount(price.rental_days)} ×{' '}
						{formatPrice(price.daily_rate_in_grosze)}
					</dd>
				</div>
				<div className={`${row} ${total}`}>
					<dt>Total</dt>
					<dd>{formatPrice(price.total_price_in_grosze)}</dd>
				</div>
			</dl>
			<p className={note}>Times are in Warsaw time.</p>
		</aside>
	);
}

export { CheckoutSummary };
