import { describe, expect, it } from 'vitest';

import { safeRedirect } from '@/features/auth/lib/safe-redirect';

describe('safeRedirect', () => {
	it.each([
		'https://evil.example',
		'//evil.example',
		'//evil.example/cars',
		'/\\evil.example',
		'/login',
		'/%2f%2fevil.example',
		'/admin',
		'/cars/0',
		'/cars/abc',
		'/cars\n',
		undefined,
		42,
	])('returns the fallback for %j', (value) => {
		expect(safeRedirect(value)).toBe('/');
	});

	it('keeps a car details path with its query unchanged', () => {
		const path = '/cars/2?starts_on=2030-12-01&ends_on=2030-12-03';

		expect(safeRedirect(path)).toBe(path);
	});

	it.each(['/bookings?page=2', '/cars', '/'])('keeps %s unchanged', (path) => {
		expect(safeRedirect(path)).toBe(path);
	});
});
