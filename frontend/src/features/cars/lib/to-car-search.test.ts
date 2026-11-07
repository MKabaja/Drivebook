import { describe, expect, it } from 'vitest';

import { toCarSearch } from '@/features/cars/lib/to-car-search';

describe('toCarSearch', () => {
	it('drops empty fields', () => {
		const search = toCarSearch({
			starts_on: '',
			ends_on: '',
			seats: '',
			transmission: '',
		});

		expect(search).toEqual({
			starts_on: undefined,
			ends_on: undefined,
			seats: undefined,
			transmission: undefined,
		});
	});

	it('converts seats to a number and keeps the other values', () => {
		const search = toCarSearch({
			starts_on: '2026-11-10',
			ends_on: '2026-11-13',
			seats: '4',
			transmission: 'manual',
		});

		expect(search).toEqual({
			starts_on: '2026-11-10',
			ends_on: '2026-11-13',
			seats: 4,
			transmission: 'manual',
		});
	});

	it('drops an unknown transmission', () => {
		const search = toCarSearch({
			starts_on: '',
			ends_on: '',
			seats: '',
			transmission: 'diesel',
		});

		expect(search.transmission).toBeUndefined();
	});
});
