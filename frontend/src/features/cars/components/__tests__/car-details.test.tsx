import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';
import { resource } from '@/test/msw/envelopes';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/utils/render-app';

describe('car details', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
		vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows the not-found page when the API has no such car', async () => {
		server.use(
			http.get('/api/cars/999', () =>
				HttpResponse.json({ message: 'Car not found.' }, { status: 404 }),
			),
		);
		renderApp('/cars/999');

		expect(
			await screen.findByRole('heading', { name: 'Page not found' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('navigation', { name: 'Main navigation' }),
		).toBeInTheDocument();
	});

	it('shows the not-found page without calling the API for a malformed id', async () => {
		const requested: string[] = [];
		server.use(
			http.get('/api/cars/:carId', ({ request }) => {
				requested.push(request.url);
				return HttpResponse.json(resource(makeCar()));
			}),
		);
		renderApp('/cars/abc');

		expect(
			await screen.findByRole('heading', { name: 'Page not found' }),
		).toBeInTheDocument();
		expect(requested).toEqual([]);
	});

	it('shows the price and unavailability for the chosen dates', async () => {
		const requested: URLSearchParams[] = [];
		server.use(
			http.get('/api/cars/3', ({ request }) => {
				requested.push(new URL(request.url).searchParams);
				return HttpResponse.json(
					resource(makeCar({ price: makeRentalPrice(), is_available: false })),
				);
			}),
		);
		renderApp('/cars/3?starts_on=2026-11-10&ends_on=2026-11-13');

		expect(
			await screen.findByRole('heading', { level: 1, name: 'Ford Mustang' }),
		).toBeInTheDocument();
		expect(requested[0]?.get('starts_on')).toBe('2026-11-10');
		expect(requested[0]?.get('ends_on')).toBe('2026-11-13');
		expect(screen.getByText('3 days · PLN 1,347 in total')).toBeInTheDocument();
		expect(
			screen.getByText('This car is already booked on these dates.'),
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Back to cars' })).toHaveAttribute(
			'href',
			'/cars?starts_on=2026-11-10&ends_on=2026-11-13',
		);
	});
});
