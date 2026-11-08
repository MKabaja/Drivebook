import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeBooking } from '@/test/factories/booking.factory';
import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';
import { makeUser } from '@/test/factories/user.factory';
import { page, resource } from '@/test/msw/envelopes';
import { signedInAs } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createDeferred } from '@/test/utils/deferred';
import { renderApp } from '@/test/utils/render-app';

const DATES = 'starts_on=2026-11-10&ends_on=2026-11-13';
const CHECKOUT_PATH = `/cars/3/checkout?${DATES}`;
const PAY_BUTTON = /^Pay PLN\s1,347 and book$/;
const APPROVED_CARD = '4242 4242 4242 4242';
const DECLINED_CARD = '4000 0000 0000 0002';

function availableCar() {
	return makeCar({
		price: makeRentalPrice(),
		is_available: true,
		alternative_dates: null,
	});
}

function repricedCar() {
	return makeCar({
		daily_rate_in_grosze: 49900,
		price: makeRentalPrice({
			daily_rate_in_grosze: 49900,
			total_price_in_grosze: 149700,
		}),
		is_available: true,
		alternative_dates: null,
	});
}

async function fillCard(user: UserEvent, number: string) {
	await user.type(await screen.findByLabelText('Card number'), number);
	await user.type(screen.getByLabelText('Expiry date (MM/YY)'), '12/30');
	await user.type(screen.getByLabelText('CVC'), '123');
}

describe('checkout', () => {
	beforeEach(() => {
		vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
	});

	it('lets a guest sign in inline and move on to payment', async () => {
		const anna = makeUser({
			name: 'Anna Driver',
			email: 'anna@drivebook.test',
		});
		server.use(
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/login', () => HttpResponse.json(resource(anna))),
		);
		const { router, user } = renderApp(CHECKOUT_PATH);

		expect(
			await screen.findByRole('button', { name: 'Sign in', pressed: true }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Create account' }),
		).toBeInTheDocument();
		expect(screen.getByLabelText('Card number')).toBeDisabled();
		expect(screen.getByLabelText('Expiry date (MM/YY)')).toBeDisabled();
		expect(screen.getByLabelText('CVC')).toBeDisabled();
		expect(
			screen.getByText('Sign in or create an account above to pay.'),
		).toBeInTheDocument();

		await user.type(screen.getByLabelText('Email address'), anna.email);
		await user.type(
			screen.getByLabelText('Password'),
			'demo-password-123{Enter}',
		);

		expect(
			await screen.findByText(
				(_, element) =>
					element?.tagName === 'P' &&
					element.textContent ===
						'Booking as Anna Driver (anna@drivebook.test)',
			),
		).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: '2. Payment' })).toHaveFocus();
		expect(router.state.location.pathname).toBe('/cars/3/checkout');
	});

	it('books once with the quoted rate and lands on the confirmation', async () => {
		const bodies: unknown[] = [];
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', async ({ request }) => {
				bodies.push(await request.json());
				return HttpResponse.json(resource(makeBooking({ id: 21 })), {
					status: 201,
				});
			}),
			http.get('/api/bookings', () =>
				HttpResponse.json(page([makeBooking({ id: 21 })])),
			),
		);
		const { router, user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));

		expect(await screen.findByRole('status')).toHaveTextContent(
			'Booking confirmed. The demo payment was approved — no real money was charged.',
		);
		expect(router.state.location.pathname).toBe('/bookings');
		expect(router.state.location.search).toMatchObject({ booked: 21 });
		expect(bodies).toEqual([
			{
				car_id: 3,
				starts_on: '2026-11-10',
				ends_on: '2026-11-13',
				expected_daily_rate_in_grosze: 44900,
			},
		]);
	});

	it('does not book when the demo card is declined', async () => {
		let postRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', () => {
				postRequests += 1;
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, DECLINED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Your card was declined. No charge was made.',
		);
		expect(postRequests).toBe(0);
	});

	it('shows the new total after a 409, focuses the summary and rebooks only on a second click', async () => {
		let carRequests = 0;
		const bodies: { expected_daily_rate_in_grosze: number }[] = [];
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () => {
				carRequests += 1;
				return HttpResponse.json(
					resource(carRequests === 1 ? availableCar() : repricedCar()),
				);
			}),
			http.post('/api/bookings', async ({ request }) => {
				bodies.push(
					(await request.json()) as { expected_daily_rate_in_grosze: number },
				);
				if (bodies.length === 1) {
					return HttpResponse.json(
						{ message: 'The daily rate has changed.' },
						{ status: 409 },
					);
				}
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'The daily rate has changed. The new total is PLN 1,497. No charge was made.',
		);
		expect(
			screen.getByRole('complementary', { name: 'Your rental' }),
		).toHaveFocus();
		expect(bodies).toHaveLength(1);

		await user.click(
			screen.getByRole('button', { name: /^Pay PLN\s1,497 and book$/ }),
		);

		await screen.findByRole('heading', { level: 1, name: 'My bookings' });
		expect(bodies).toHaveLength(2);
		expect(bodies[1]?.expected_daily_rate_in_grosze).toBe(49900);
	});

	it('keeps the pay button busy and hides the alert until the refreshed price arrives after a 409', async () => {
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
				return HttpResponse.json(resource(repricedCar()));
			}),
			http.post('/api/bookings', () =>
				HttpResponse.json(
					{ message: 'The daily rate has changed.' },
					{ status: 409 },
				),
			),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));
		await vi.waitFor(() => expect(carRequests).toBe(2));

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Booking…' })).toHaveAttribute(
			'aria-disabled',
			'true',
		);

		refreshed.resolve();

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'The daily rate has changed. The new total is PLN 1,497. No charge was made.',
		);
	});

	it('offers other dates after a 422 and does not retry by itself', async () => {
		let carRequests = 0;
		let postRequests = 0;
		const message = 'The car is already booked on these dates.';
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () => {
				carRequests += 1;
				return HttpResponse.json(
					resource(
						carRequests === 1
							? availableCar()
							: makeCar({
									price: makeRentalPrice(),
									is_available: false,
									alternative_dates: null,
								}),
					),
				);
			}),
			http.post('/api/bookings', () => {
				postRequests += 1;
				return HttpResponse.json(
					{
						message: 'The given data was invalid.',
						errors: { starts_on: [message] },
					},
					{ status: 422 },
				);
			}),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			`${message} No charge was made.`,
		);
		expect(
			await screen.findByText("This car isn't free on these dates.", {
				exact: false,
			}),
		).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: '2. Payment' })).toHaveFocus();
		expect(
			screen.getByRole('link', { name: 'Choose other dates' }),
		).toHaveAttribute('href', `/cars/3?${DATES}`);
		expect(postRequests).toBe(1);
	});

	it('asks to sign in again after a 401 and clears the error after signing in', async () => {
		server.use(
			http.post('/api/login', () =>
				HttpResponse.json(
					resource(
						makeUser({ name: 'Anna Driver', email: 'anna@drivebook.test' }),
					),
				),
			),
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', () =>
				HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
			),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Your session has expired. Sign in again to finish booking. No charge was made.',
		);
		expect(
			await screen.findByRole('button', { name: 'Create account' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Sign in', pressed: true }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: '1. Your account' }),
		).toHaveFocus();

		await user.type(
			screen.getByLabelText('Email address'),
			'anna@drivebook.test',
		);
		await user.type(
			screen.getByLabelText('Password'),
			'demo-password-123{Enter}',
		);

		expect(
			await screen.findByText(
				(_, element) =>
					element?.tagName === 'P' &&
					element.textContent ===
						'Booking as Anna Driver (anna@drivebook.test)',
			),
		).toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { name: '2. Payment' })).toHaveFocus();
	});

	it('sends one booking when the pay button is clicked twice', async () => {
		const response = createDeferred();
		let postRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', async () => {
				postRequests += 1;
				await response.promise;
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
		);
		const { user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.dblClick(screen.getByRole('button', { name: PAY_BUTTON }));
		await vi.waitFor(() => expect(postRequests).toBeGreaterThan(0));
		await screen.findByRole('button', { name: 'Booking…' });
		response.resolve();

		await screen.findByRole('heading', { level: 1, name: 'My bookings' });
		expect(postRequests).toBe(1);
	});

	it('sends no booking when the user leaves during the simulated payment', async () => {
		let postRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/cars/3', () =>
				HttpResponse.json(resource(availableCar())),
			),
			http.post('/api/bookings', () => {
				postRequests += 1;
				return HttpResponse.json(resource(makeBooking()), { status: 201 });
			}),
		);
		const { router, user } = renderApp(CHECKOUT_PATH);

		await fillCard(user, APPROVED_CARD);
		await user.click(screen.getByRole('button', { name: PAY_BUTTON }));
		await user.click(screen.getByRole('link', { name: 'Back to the car' }));
		await vi.waitFor(() =>
			expect(router.state.location.pathname).toBe('/cars/3'),
		);
		await new Promise((resolve) => setTimeout(resolve, 600));

		expect(postRequests).toBe(0);
	});

	it('goes back to the car page when the URL has no dates', async () => {
		server.use(
			http.get('/api/cars/3', () => HttpResponse.json(resource(makeCar()))),
		);
		const { router } = renderApp('/cars/3/checkout');

		await vi.waitFor(() =>
			expect(router.state.location.pathname).toBe('/cars/3'),
		);
	});

	it('shows the not-found page when the API has no such car', async () => {
		server.use(
			http.get('/api/cars/3', () =>
				HttpResponse.json({ message: 'Car not found.' }, { status: 404 }),
			),
		);
		renderApp(CHECKOUT_PATH);

		expect(
			await screen.findByRole('heading', { name: 'Page not found' }),
		).toBeInTheDocument();
	});
});
