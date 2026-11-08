import { describe, expect, it } from 'vitest';

import { describeCheckoutFailure } from '@/features/bookings/lib/describe-checkout-failure';

import { makeRentalPrice } from '@/test/factories/car.factory';

describe('describeCheckoutFailure', () => {
	it('tells the user to check My bookings, without a no-charge claim, when the outcome is unknown', () => {
		expect(
			describeCheckoutFailure({ kind: 'unconfirmed' }, makeRentalPrice()),
		).toBe(
			"We couldn't confirm your booking. Check My bookings before you try again.",
		);
	});

	it('states that no charge was made for a general failure', () => {
		expect(
			describeCheckoutFailure(
				{ kind: 'general', message: 'Something went wrong.' },
				makeRentalPrice(),
			),
		).toBe('Something went wrong. No charge was made.');
	});
});
