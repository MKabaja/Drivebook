import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeBooking } from '@/test/factories/booking.factory';
import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';
import { makeUser } from '@/test/factories/user.factory';
import { page, resource } from '@/test/msw/envelopes';
import { signedInAs } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createDeferred } from '@/test/utils/deferred';
import { renderApp } from '@/test/utils/render-app';

const DETAILS_PATH = '/cars/3?starts_on=2026-11-10&ends_on=2026-11-13';
const TAKEN_MESSAGE = 'This car is already booked for the selected dates.';

function availableCar() {
	return makeCar({
		price: makeRentalPrice(),
		is_available: true,
		alternative_dates: null,
	});
}

describe('reserving a car', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
		vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('offers a guest a sign-in link that returns to the chosen dates', async () => {
		server.use(
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
		);
		renderApp(DETAILS_PATH);

		const link = await screen.findByRole('link', { name: 'Sign in to book' });

		expect(link).toHaveAttribute(
			'href',
			'/login?redirect=%2Fcars%2F3%3Fstarts_on%3D2026-11-10%26ends_on%3D2026-11-13',
		);
		expect(
			screen.queryByRole('button', { name: 'Book this car' }),
		).not.toBeInTheDocument();
	});

	it('sends one booking request and shows the bookings list on success', async () => {
		const bodies: unknown[] = [];
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', async ({ request }) => {
				bodies.push(await request.json());
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
		);
		const { router, user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);

		expect(
			await screen.findByRole('heading', { level: 1, name: 'My bookings' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/bookings');
		expect(bodies).toEqual([
			{
				car_id: 3,
				starts_on: '2026-11-10',
				ends_on: '2026-11-13',
				expected_daily_rate_in_grosze: 44900,
			},
		]);
	});

	it('asks to confirm the new price after a 409 and does not retry by itself', async () => {
		let carRequests = 0;
		const bodies: { expected_daily_rate_in_grosze: number }[] = [];
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () => {
				carRequests += 1;
				if (carRequests === 1) {
					return HttpResponse.json(resource(availableCar()));
				}
				return HttpResponse.json(
					resource(
						makeCar({
							daily_rate_in_grosze: 49900,
							price: makeRentalPrice({
								daily_rate_in_grosze: 49900,
								total_price_in_grosze: 149700,
							}),
							is_available: true,
							alternative_dates: null,
						}),
					),
				);
			}),
			http.post('/api/bookings', async ({ request }) => {
				const body = (await request.json()) as {
					expected_daily_rate_in_grosze: number;
				};
				bodies.push(body);
				if (bodies.length === 1) {
					return HttpResponse.json(
						{
							message:
								'The daily rate has changed. Please review the updated price.',
						},
						{ status: 409 },
					);
				}
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
		);
		const { user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);
		const confirm = await screen.findByRole('button', {
			name: 'Confirm new price and book',
		});

		expect(screen.getByRole('alert')).toHaveTextContent(
			'The daily rate has changed. The new total is PLN 1,497',
		);
		expect(bodies).toHaveLength(1);
		expect(
			screen.getByRole('region', { name: 'Price for your dates' }),
		).toHaveFocus();

		await user.click(confirm);

		await screen.findByRole('heading', { level: 1, name: 'My bookings' });
		expect(bodies).toHaveLength(2);
		expect(bodies[1]?.expected_daily_rate_in_grosze).toBe(49900);
	});

	it('keeps the button busy and hides the message until the refreshed price arrives after a 409', async () => {
		const refreshed = createDeferred();
		let carRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', async () => {
				carRequests += 1;
				if (carRequests === 1) {
					return HttpResponse.json(resource(availableCar()));
				}
				await refreshed.promise;
				return HttpResponse.json(
					resource(
						makeCar({
							daily_rate_in_grosze: 49900,
							price: makeRentalPrice({
								daily_rate_in_grosze: 49900,
								total_price_in_grosze: 149700,
							}),
							is_available: true,
							alternative_dates: null,
						}),
					),
				);
			}),
			http.post('/api/bookings', () =>
				HttpResponse.json(
					{
						message:
							'The daily rate has changed. Please review the updated price.',
					},
					{ status: 409 },
				),
			),
		);
		const { user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);
		await waitFor(() => expect(carRequests).toBe(2));

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Booking…' })).toBeDisabled();

		refreshed.resolve();

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'The daily rate has changed. The new total is PLN 1,497 — confirm to book at this price.',
		);
		expect(
			screen.getByRole('button', { name: 'Confirm new price and book' }),
		).toBeEnabled();
	});

	it('sends no second booking when the dates change while the request is in flight', async () => {
		const response = createDeferred();
		let postRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', ({ request }) => {
				const endsOn = new URL(request.url).searchParams.get('ends_on');
				if (endsOn === '2026-11-14') {
					return HttpResponse.json(
						resource(
							makeCar({
								price: makeRentalPrice({
									ends_on: '2026-11-14',
									rental_days: 4,
									total_price_in_grosze: 179600,
								}),
								is_available: true,
								alternative_dates: null,
							}),
						),
					);
				}
				return HttpResponse.json(resource(availableCar()));
			}),
			http.post('/api/bookings', async () => {
				postRequests += 1;
				await response.promise;
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
		);
		const { user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);
		expect(
			await screen.findByRole('button', { name: 'Booking…' }),
		).toBeDisabled();
		const returnDate = screen.getByLabelText('Return date');
		await user.clear(returnDate);
		await user.type(returnDate, '2026-11-14');
		await user.click(screen.getByRole('button', { name: 'Check price' }));

		await screen.findByText('4 days × PLN 449');
		const busy = screen.getByRole('button', { name: 'Booking…' });
		expect(busy).toBeDisabled();
		await user.click(busy);
		expect(postRequests).toBe(1);

		response.resolve();
		await screen.findByRole('heading', { level: 1, name: 'My bookings' });
		expect(postRequests).toBe(1);
	});

	it('refreshes and offers other dates after a 422 without booking again', async () => {
		let carRequests = 0;
		const requestedStarts: (string | null)[] = [];
		let postRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', ({ request }) => {
				carRequests += 1;
				const startsOn = new URL(request.url).searchParams.get('starts_on');
				requestedStarts.push(startsOn);
				if (startsOn === '2026-11-13') {
					return HttpResponse.json(
						resource(
							makeCar({
								price: makeRentalPrice({
									starts_on: '2026-11-13',
									ends_on: '2026-11-16',
								}),
								is_available: true,
								alternative_dates: null,
							}),
						),
					);
				}
				if (carRequests === 1) {
					return HttpResponse.json(resource(availableCar()));
				}
				return HttpResponse.json(
					resource(
						makeCar({
							price: makeRentalPrice(),
							is_available: false,
							alternative_dates: makeRentalPrice({
								starts_on: '2026-11-13',
								ends_on: '2026-11-16',
							}),
						}),
					),
				);
			}),
			http.post('/api/bookings', () => {
				postRequests += 1;
				return HttpResponse.json(
					{
						message: 'The given data was invalid.',
						errors: { starts_on: [TAKEN_MESSAGE] },
					},
					{ status: 422 },
				);
			}),
		);
		const { router, user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);

		expect(
			await screen.findByText('This car is already booked on these dates.'),
		).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Book this car' }),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole('link', { name: 'Choose these dates' }));

		await vi.waitFor(() => expect(requestedStarts).toContain('2026-11-13'));
		expect(router.state.location.search).toMatchObject({
			starts_on: '2026-11-13',
			ends_on: '2026-11-16',
		});
		expect(postRequests).toBe(1);
	});

	it('keeps the chosen dates through sign-in after a 401', async () => {
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', () =>
				HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
			),
			http.post('/api/login', () => HttpResponse.json(resource(makeUser()))),
		);
		const { router, user } = renderApp(DETAILS_PATH);

		await user.click(
			await screen.findByRole('button', { name: 'Book this car' }),
		);

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Your session has expired. Sign in to book these dates.',
		);
		expect(
			screen.queryByRole('button', { name: 'Book this car' }),
		).not.toBeInTheDocument();
		const navigation = screen.getByRole('navigation', {
			name: 'Main navigation',
		});
		expect(
			within(navigation).getByRole('link', { name: 'Sign in' }),
		).toBeInTheDocument();

		expect(screen.getByRole('link', { name: 'Sign in to book' })).toHaveFocus();

		await user.click(screen.getByRole('link', { name: 'Sign in to book' }));
		await user.type(
			await screen.findByLabelText('Email address'),
			'demo@drivebook.test',
		);
		await user.type(screen.getByLabelText('Password'), 'demo-password-123');
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		expect(
			await screen.findByRole('button', { name: 'Book this car' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/cars/3');
		expect(router.state.location.search).toMatchObject({
			starts_on: '2026-11-10',
			ends_on: '2026-11-13',
		});
		expect(screen.getByLabelText('Pick-up date')).toHaveValue('2026-11-10');
	});
});
