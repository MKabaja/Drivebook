import { describe, expect, it } from 'vitest';

import { addDays } from '@/shared/lib/add-days';
import { formatDayCount } from '@/shared/lib/format-day-count';
import { formatPrice } from '@/shared/lib/format-price';
import { toWarsawDate } from '@/shared/lib/to-warsaw-date';

describe('toWarsawDate', () => {
	it.each([
		['2026-11-07T22:59:59Z', '2026-11-07'],
		['2026-11-07T23:00:00Z', '2026-11-08'],
		['2026-07-01T21:59:59Z', '2026-07-01'],
		['2026-07-01T22:00:00Z', '2026-07-02'],
	])('maps %s to the Warsaw date %s', (instant, expected) => {
		expect(toWarsawDate(new Date(instant))).toBe(expected);
	});
});

describe('addDays', () => {
	it.each([
		['2026-03-28', 1, '2026-03-29'],
		['2026-01-31', 1, '2026-02-01'],
		['2026-03-01', -1, '2026-02-28'],
		['2028-02-28', 1, '2028-02-29'],
	])('adds %s + %i day(s) = %s', (date, days, expected) => {
		expect(addDays(date, days)).toBe(expected);
	});
});

describe('formatPrice', () => {
	it('omits grosze for whole zloty amounts', () => {
		expect(formatPrice(64900)).toBe('PLN\u00A0649');
	});

	it('shows grosze and thousands separator otherwise', () => {
		expect(formatPrice(134750)).toBe('PLN\u00A01,347.50');
	});
});

describe('formatDayCount', () => {
	it('uses the singular for one day', () => {
		expect(formatDayCount(1)).toBe('1 day');
	});

	it('uses the plural for several days', () => {
		expect(formatDayCount(3)).toBe('3 days');
	});
});
