import { describe, expect, it } from 'vitest';

import { bookingSchema } from '@/features/bookings/model/booking.schemas';

import { makeBooking } from '@/test/factories/booking.factory';

describe('makeBooking', () => {
	it('builds a booking that satisfies the booking schema', () => {
		const booking = makeBooking();

		expect(bookingSchema.parse(booking)).toEqual(booking);
	});
});
