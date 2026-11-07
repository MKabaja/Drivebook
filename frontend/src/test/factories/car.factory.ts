import type { Car, RentalPrice } from '@/features/cars/model/car.schemas';

function makeCar(overrides: Partial<Car> = {}): Car {
	return {
		id: 3,
		name: 'Ford Mustang',
		seats: 4,
		transmission: 'manual',
		category: 'muscle',
		daily_rate_in_grosze: 44900,
		image_path: '/images/cars/ford-mustang.jpg',
		...overrides,
	};
}

function makeRentalPrice(overrides: Partial<RentalPrice> = {}): RentalPrice {
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
