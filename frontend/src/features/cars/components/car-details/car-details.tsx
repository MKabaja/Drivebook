import { Link } from '@tanstack/react-router';
import { ArrowLeft, Gauge, Users } from 'lucide-react';

import { uiStyles } from '@/shared/components/ui.styles';
import { PICKUP_TIME } from '@/shared/config';
import { formatCalendarDate } from '@/shared/lib/format-calendar-date';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import {
	labelByCategory,
	labelByTransmission,
} from '@/features/cars/model/car.constants';
import type { Car } from '@/features/cars/model/car.schemas';
import type { RentalDatesSearch } from '@/features/cars/model/car-search.schemas';

import { carDetailsStyles } from './car-details.styles';

type CarDetailsProps = { car: Car; dates: RentalDatesSearch };

function CarDetails({ car, dates }: CarDetailsProps) {
	const { shell, page, eyebrow, title, panel } = uiStyles;
	const {
		backLink,
		layout,
		media,
		image,
		specs,
		spec,
		rate,
		unit,
		summary,
		summaryTitle,
		unavailable,
		note,
	} = carDetailsStyles;

	return (
		<main id="main" className={`${shell} ${page}`}>
			<Link to="/cars" search={dates} className={backLink}>
				<ArrowLeft size={17} aria-hidden="true" />
				Back to cars
			</Link>
			<div className={layout}>
				<figure className={media}>
					<img
						className={image}
						src={car.image_path}
						alt={car.name}
						width="900"
						height="563"
					/>
				</figure>
				<div>
					<p className={eyebrow}>{labelByCategory[car.category]}</p>
					<h1 className={title}>{car.name}</h1>
					<ul className={specs}>
						<li className={spec}>
							<Gauge size={16} aria-hidden="true" />
							{labelByTransmission[car.transmission]}
						</li>
						<li className={spec}>
							<Users size={16} aria-hidden="true" />
							{car.seats} seats
						</li>
					</ul>
					<p className={rate}>
						{formatPrice(car.daily_rate_in_grosze)}
						<span className={unit}>/ day</span>
					</p>
					<section className={`${panel} ${summary}`} aria-label="Your dates">
						{car.price ? (
							<>
								<h2 className={summaryTitle}>
									{formatCalendarDate(car.price.starts_on)} –{' '}
									{formatCalendarDate(car.price.ends_on)}
								</h2>
								<p>
									{formatDayCount(car.price.rental_days)} ·{' '}
									{formatPrice(car.price.total_price_in_grosze)} in total
								</p>
								{car.is_available === false && (
									<p className={unavailable}>
										This car is already booked on these dates.
									</p>
								)}
							</>
						) : (
							<p>
								Choose your dates in the{' '}
								<Link to="/cars" className="text-accent underline">
									catalog
								</Link>{' '}
								to see the full price.
							</p>
						)}
						<p className={note}>
							Pick-up and return at {PICKUP_TIME} (Warsaw time).
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}

export { CarDetails };
