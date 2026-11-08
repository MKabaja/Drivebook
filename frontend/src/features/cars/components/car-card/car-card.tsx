import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Gauge, Users } from 'lucide-react';

import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import {
	labelByCategory,
	labelByTransmission,
} from '@/features/cars/model/car.constants';
import type { Car } from '@/features/cars/model/car.schemas';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

import { carCardStyles } from './car-card.styles';

type CarCardProps = { car: Car; search: CarSearch };

function CarCard({ car, search }: CarCardProps) {
	const {
		card,
		media,
		image,
		badge,
		body,
		title,
		titleLink,
		specs,
		spec,
		footer,
		price,
		unit,
		total,
		cta,
	} = carCardStyles;

	return (
		<article className={card}>
			<div className={media}>
				<img
					className={image}
					src={car.image_url}
					srcSet={car.image_srcset}
					sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
					alt=""
					width="640"
					height="400"
					loading="lazy"
				/>
				<span className={badge}>{labelByCategory[car.category]}</span>
			</div>
			<div className={body}>
				<h3 className={title}>
					<Link
						to="/cars/$carId"
						params={{ carId: String(car.id) }}
						search={search}
						className={titleLink}
					>
						{car.name}
					</Link>
				</h3>
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
				<div className={footer}>
					<div>
						<p className={price}>
							{formatPrice(car.daily_rate_in_grosze)}
							<span className={unit}>/ day</span>
						</p>
						{car.price && (
							<p className={total}>
								{formatPrice(car.price.total_price_in_grosze)} for{' '}
								{formatDayCount(car.price.rental_days)}
							</p>
						)}
					</div>
					<span className={cta} aria-hidden="true">
						View car
						<ArrowUpRight size={17} />
					</span>
				</div>
			</div>
		</article>
	);
}

export { CarCard };
