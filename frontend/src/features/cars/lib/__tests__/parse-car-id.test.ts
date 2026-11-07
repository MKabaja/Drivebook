import { describe, expect, it } from 'vitest';

import { parseCarId } from '@/features/cars/lib/parse-car-id';

describe('parseCarId', () => {
	it.each([
		['3', 3],
		['120', 120],
	])('parses %s to %i', (value, expected) => {
		expect(parseCarId(value)).toBe(expected);
	});

	it.each(['0', '03', 'abc', '1.5', ''])('rejects "%s"', (value) => {
		expect(parseCarId(value)).toBeUndefined();
	});
});
