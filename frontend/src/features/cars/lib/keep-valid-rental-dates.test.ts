import { describe, expect, it } from 'vitest';

import { keepValidRentalDates } from '@/features/cars/lib/keep-valid-rental-dates';

describe('keepValidRentalDates', () => {
	const today = '2026-11-07';

	it('keeps a valid date pair untouched', () => {
		const search = { starts_on: '2026-11-10', ends_on: '2026-11-13', seats: 4 };

		expect(keepValidRentalDates(search, today)).toEqual(search);
	});

	it('drops both dates but keeps other filters when the pair is invalid', () => {
		const search = {
			starts_on: '2026-11-07',
			ends_on: '2026-11-09',
			seats: 4,
			page: 2,
		};

		expect(keepValidRentalDates(search, today)).toEqual({
			starts_on: undefined,
			ends_on: undefined,
			seats: 4,
			page: 2,
		});
	});
});
