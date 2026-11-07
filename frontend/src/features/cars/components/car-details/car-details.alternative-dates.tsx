import { Link } from '@tanstack/react-router';
import { CalendarClock } from 'lucide-react';

import { uiStyles } from '@/shared/components/ui.styles';
import { ALTERNATIVE_DATES_WINDOW_DAYS } from '@/shared/config';
import { formatCalendarDate } from '@/shared/lib/format-calendar-date';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import type { RentalPrice } from '@/features/cars/model/car.schemas';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

import { carDetailsStyles } from './car-details.styles';

type CarDetailsAlternativeDatesProps = {
	carId: number;
	search: CarSearch;
	alternativeDates: RentalPrice | null | undefined;
	onChoose: () => void;
};

function CarDetailsAlternativeDates({
	carId,
	search,
	alternativeDates,
	onChoose,
}: CarDetailsAlternativeDatesProps) {
	const { secondary } = uiStyles;
	const { alternative, alternativeTitle, alternativeText } = carDetailsStyles;

	if (!alternativeDates) {
		return (
			<p className={alternativeText}>
				No free dates of the same length within {ALTERNATIVE_DATES_WINDOW_DAYS}{' '}
				days of your pick-up. Try other dates.
			</p>
		);
	}

	return (
		<section className={alternative} aria-labelledby="alternative-dates-title">
			<h3 id="alternative-dates-title" className={alternativeTitle}>
				<CalendarClock size={17} aria-hidden="true" />
				Nearest free dates
			</h3>
			<p className={alternativeText}>
				{formatCalendarDate(alternativeDates.starts_on)} –{' '}
				{formatCalendarDate(alternativeDates.ends_on)} ·{' '}
				{formatDayCount(alternativeDates.rental_days)} ·{' '}
				{formatPrice(alternativeDates.total_price_in_grosze)} in total
			</p>
			<Link
				to="/cars/$carId"
				params={{ carId: String(carId) }}
				search={{
					...search,
					starts_on: alternativeDates.starts_on,
					ends_on: alternativeDates.ends_on,
				}}
				resetScroll={false}
				onClick={onChoose}
				className={secondary}
			>
				Choose these dates
			</Link>
		</section>
	);
}

export { CarDetailsAlternativeDates };
