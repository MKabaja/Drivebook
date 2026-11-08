import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';
import { resource } from '@/test/msw/envelopes';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/utils/render-app';

describe('car details', () => {
	beforeEach(() => {
		vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
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
		const summary = screen.getByRole('region', {
			name: 'Price for your dates',
		});
		expect(within(summary).getByText('3 days × PLN 449')).toBeInTheDocument();
		expect(within(summary).getByText('PLN 1,347')).toBeInTheDocument();
		expect(
			screen.getByText('This car is already booked on these dates.'),
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Back to cars' })).toHaveAttribute(
			'href',
			'/cars?starts_on=2026-11-10&ends_on=2026-11-13',
		);
		expect(
			screen.getByText(
				'No free dates of the same length within 30 days of your pick-up. Try other dates.',
			),
		).toBeInTheDocument();
	});

	it('rejects a return before pick-up, then searches with the corrected dates', async () => {
		const requested: URLSearchParams[] = [];
		server.use(
			http.get('/api/cars/3', ({ request }) => {
				requested.push(new URL(request.url).searchParams);
				return HttpResponse.json(resource(makeCar()));
			}),
		);
		const { router, user } = renderApp('/cars/3?seats=4');
		const pickUp = await screen.findByLabelText('Pick-up date');
		const returnDate = screen.getByLabelText('Return date');
		const requestsBefore = requested.length;

		await user.type(pickUp, '2026-11-12');
		await user.type(returnDate, '2026-11-11');
		await user.click(screen.getByRole('button', { name: 'Check price' }));

		expect(
			screen.getByText('Return must be after pick-up.'),
		).toBeInTheDocument();
		expect(returnDate).toHaveFocus();
		expect(requested).toHaveLength(requestsBefore);

		await user.clear(returnDate);
		await user.type(returnDate, '2026-11-15');
		await user.click(screen.getByRole('button', { name: 'Check price' }));

		await vi.waitFor(() => expect(requested).toHaveLength(requestsBefore + 1));
		expect(router.state.location.search).toEqual({
			seats: 4,
			starts_on: '2026-11-12',
			ends_on: '2026-11-15',
		});
		const last = requested.at(-1);
		expect(last?.get('starts_on')).toBe('2026-11-12');
		expect(last?.get('ends_on')).toBe('2026-11-15');
		expect(last?.has('seats')).toBe(false);
	});

	it('keeps the whole search in the link back to the catalog', async () => {
		server.use(
			http.get('/api/cars/3', () => HttpResponse.json(resource(makeCar()))),
		);
		renderApp(
			'/cars/3?seats=4&transmission=manual&page=2&starts_on=2026-11-10&ends_on=2026-11-13',
		);

		const href = (
			await screen.findByRole('link', { name: 'Back to cars' })
		).getAttribute('href');

		expect(href).toContain('seats=4');
		expect(href).toContain('transmission=manual');
		expect(href).toContain('page=2');
	});

	it('drops dates the API rejects and asks to choose them again', async () => {
		server.use(
			http.get('/api/cars/3', ({ request }) => {
				if (new URL(request.url).searchParams.has('starts_on')) {
					return HttpResponse.json(
						{
							message: 'x',
							errors: { starts_on: ['The pick-up date is not allowed.'] },
						},
						{ status: 422 },
					);
				}
				return HttpResponse.json(resource(makeCar()));
			}),
		);
		const { router } = renderApp(
			'/cars/3?starts_on=2026-11-10&ends_on=2026-11-13&seats=4',
		);

		expect(
			await screen.findByRole('heading', { level: 1, name: 'Ford Mustang' }),
		).toBeInTheDocument();
		expect(router.state.location.search).toEqual({ seats: 4 });
		expect(
			screen.getByText(
				'Choose your dates to see the full price and book this car.',
			),
		).toBeInTheDocument();
	});

	it('links an available car with dates to the checkout for the same dates', async () => {
		server.use(
			http.get('/api/cars/3', () =>
				HttpResponse.json(
					resource(makeCar({ price: makeRentalPrice(), is_available: true })),
				),
			),
		);
		renderApp('/cars/3?starts_on=2026-11-10&ends_on=2026-11-13');

		expect(
			await screen.findByRole('link', { name: 'Continue to checkout' }),
		).toHaveAttribute(
			'href',
			'/cars/3/checkout?starts_on=2026-11-10&ends_on=2026-11-13',
		);
	});
});
