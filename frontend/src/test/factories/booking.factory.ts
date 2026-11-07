import type { Booking } from '@/features/bookings/model/booking.schemas';

import { makeCar } from '@/test/factories/car.factory';

type BookingOverrides = Partial<Booking>;

function makeBooking(overrides: BookingOverrides = {}): Booking {
	return {
		id: 7,
		car_id: 3,
		starts_on: '2026-11-10',
		ends_on: '2026-11-13',
		status: 'confirmed',
		daily_rate_in_grosze: 44900,
		total_price_in_grosze: 134700,
		rental_days: 3,
		can_cancel: true,
		car: makeCar(),
		...overrides,
	};
}

export { makeBooking };
