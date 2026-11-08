import type { Car, RentalPrice } from '@/features/cars/model/car.schemas';

type CarOverrides = Partial<Car>;
type RentalPriceOverrides = Partial<RentalPrice>;

function makeCar(overrides: CarOverrides = {}): Car {
	return {
		id: 3,
		name: 'Ford Mustang',
		seats: 4,
		transmission: 'manual',
		category: 'sport',
		daily_rate_in_grosze: 44900,
		image_url: '/storage/cars/ford-mustang-1280.webp',
		image_srcset:
			'/storage/cars/ford-mustang-640.webp 640w, /storage/cars/ford-mustang-1280.webp 1280w',
		...overrides,
	};
}

function makeRentalPrice(overrides: RentalPriceOverrides = {}): RentalPrice {
	return {
		starts_on: '2026-11-10',
		ends_on: '2026-11-13',
		rental_days: 3,
		daily_rate_in_grosze: 44900,
		total_price_in_grosze: 134700,
		...overrides,
	};
}

export { makeCar, makeRentalPrice };
