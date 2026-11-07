import { describe, expect, it } from 'vitest';

import { findRentalDatesError } from '@/features/cars/lib/find-rental-dates-error';

describe('findRentalDatesError', () => {
	const today = '2026-11-07';

	it.each([
		{ starts_on: undefined, ends_on: undefined, expected: undefined },
		{
			starts_on: undefined,
			ends_on: '2026-11-12',
			expected: { field: 'starts_on', message: 'Choose a pick-up date.' },
		},
		{
			starts_on: '2026-11-10',
			ends_on: undefined,
			expected: { field: 'ends_on', message: 'Choose a return date.' },
		},
		{
			starts_on: '2026-11-07',
			ends_on: '2026-11-09',
			expected: {
				field: 'starts_on',
				message: 'Pick-up is available from tomorrow.',
			},
		},
		{ starts_on: '2026-11-08', ends_on: '2026-11-09', expected: undefined },
		{ starts_on: '2027-05-06', ends_on: '2027-05-07', expected: undefined },
		{
			starts_on: '2027-05-07',
			ends_on: '2027-05-08',
			expected: {
				field: 'starts_on',
				message: 'Pick-up must be within 180 days from today.',
			},
		},
		{
			starts_on: '2026-11-10',
			ends_on: '2026-11-10',
			expected: { field: 'ends_on', message: 'Return must be after pick-up.' },
		},
		{ starts_on: '2026-11-10', ends_on: '2026-12-10', expected: undefined },
		{
			starts_on: '2026-11-10',
			ends_on: '2026-12-11',
			expected: {
				field: 'ends_on',
				message: 'A rental can last up to 30 days.',
			},
		},
	])(
		'returns $expected for $starts_on – $ends_on',
		({ starts_on, ends_on, expected }) => {
			expect(findRentalDatesError({ starts_on, ends_on }, today)).toEqual(
				expected,
			);
		},
	);
});
