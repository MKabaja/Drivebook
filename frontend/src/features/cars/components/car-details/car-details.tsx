import { Link } from '@tanstack/react-router';
import { ArrowLeft, Gauge, Users } from 'lucide-react';
import { type ReactNode, useRef } from 'react';

import { PICKUP_TIME } from '@/shared/config';
import { formatPrice } from '@/shared/lib/format-price';
import { uiStyles } from '@/shared/styles/ui.styles';
import {
	labelByCategory,
	labelByTransmission,
} from '@/features/cars/model/car.constants';
import type { Car, RentalPrice } from '@/features/cars/model/car.schemas';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

import { CarDetailsAlternativeDates } from './car-details.alternative-dates';
import { CarDetailsQuoteSummary } from './car-details.quote-summary';
import { CarDetailsRentalDateForm } from './car-details.rental-date-form';
import { carDetailsStyles } from './car-details.styles';

type ReserveActionSlot = {
	price: RentalPrice;
	focusPriceSummary: () => void;
};
type RenderReserveAction = (slot: ReserveActionSlot) => ReactNode;
type CarDetailsProps = {
	car: Car;
	search: CarSearch;
	today: string;
	renderReserveAction: RenderReserveAction;
};

function CarDetails({
	car,
	search,
	today,
	renderReserveAction,
}: CarDetailsProps) {
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
		booking,
		bookingTitle,
		hint,
		note,
	} = carDetailsStyles;
	const priceSummaryRef = useRef<HTMLElement>(null);

	function focusPriceSummary() {
		priceSummaryRef.current?.focus();
	}

	return (
		<main id="main" tabIndex={-1} className={`${shell} ${page}`}>
			<Link to="/cars" search={search} className={backLink}>
				<ArrowLeft size={17} aria-hidden="true" />
				Back to cars
			</Link>
			<div className={layout}>
				<figure className={media}>
					<img
						className={image}
						src={car.image_url}
						srcSet={car.image_srcset}
						sizes="(min-width: 1280px) 624px, (min-width: 1024px) 48vw, 100vw"
						alt={car.name}
						width="1280"
						height="800"
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
					<section
						className={`${panel} ${booking}`}
						aria-labelledby="car-booking-title"
					>
						<h2 id="car-booking-title" className={bookingTitle}>
							Plan your rental
						</h2>
						<CarDetailsRentalDateForm
							carId={car.id}
							search={search}
							today={today}
						/>
						{car.price === undefined && (
							<p className={hint}>
								Choose your dates to see the full price and book this car.
							</p>
						)}
						<div aria-live="polite">
							{car.price && (
								<CarDetailsQuoteSummary
									ref={priceSummaryRef}
									price={car.price}
									isAvailable={car.is_available === true}
								/>
							)}
						</div>
						{car.price &&
							car.is_available &&
							renderReserveAction({ price: car.price, focusPriceSummary })}
						{car.price && car.is_available === false && (
							<CarDetailsAlternativeDates
								carId={car.id}
								search={search}
								alternativeDates={car.alternative_dates}
								onChoose={focusPriceSummary}
							/>
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

export type { ReserveActionSlot };
export { CarDetails };
