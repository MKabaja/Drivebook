import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { HttpError } from '@/shared/api/http-error';
import { NetworkError } from '@/shared/api/network-error';
import { toBookingFailure } from '@/features/bookings/lib/to-booking-failure';

const GENERAL_MESSAGE = 'Something went wrong. Try again in a moment.';

describe('toBookingFailure', () => {
	it('reports a changed price on 409', () => {
		const error = new HttpError(409, {
			message: 'The daily rate has changed.',
		});

		expect(toBookingFailure(error)).toEqual({ kind: 'price-changed' });
	});

	it.each([401, 419])('reports a signed-out user on %i', (status) => {
		const error = new HttpError(status, { message: 'Unauthenticated.' });

		expect(toBookingFailure(error)).toEqual({ kind: 'signed-out' });
	});

	it('returns the first validation message on 422', () => {
		const message = 'This car is already booked for the selected dates.';
		const error = new HttpError(422, {
			message: 'x',
			errors: { starts_on: [message] },
		});

		expect(toBookingFailure(error)).toEqual({ kind: 'rejected', message });
	});

	it('falls back to a general message on 422 without errors', () => {
		const error = new HttpError(422, { message: 'x' });

		expect(toBookingFailure(error)).toEqual({
			kind: 'general',
			message: GENERAL_MESSAGE,
		});
	});

	it('reports an unconfirmed outcome on a network error', () => {
		const error = new NetworkError(new TypeError('fail'));

		expect(toBookingFailure(error)).toEqual({ kind: 'unconfirmed' });
	});

	it('falls back to a general message on 500', () => {
		const error = new HttpError(500, undefined);

		expect(toBookingFailure(error)).toEqual({
			kind: 'general',
			message: GENERAL_MESSAGE,
		});
	});

	it('reports an unconfirmed outcome when the response does not match the schema', () => {
		const error = z.object({ a: z.string() }).safeParse({}).error;

		expect(toBookingFailure(error)).toEqual({ kind: 'unconfirmed' });
	});
});
