import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { makeBooking } from '@/test/factories/booking.factory';
import { makeUser } from '@/test/factories/user.factory';
import { page, resource } from '@/test/msw/envelopes';
import { signedInAs } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/utils/render-app';

const CANCEL_NAME = 'Cancel booking for Ford Mustang';

describe('booking list', () => {
	it('sends a guest to sign in without asking for bookings', async () => {
		let bookingRequests = 0;
		server.use(
			http.get('/api/bookings', () => {
				bookingRequests += 1;
				return HttpResponse.json(page([]));
			}),
		);
		const { router } = renderApp('/bookings');

		await screen.findByLabelText('Email address');

		expect(router.state.location.pathname).toBe('/login');
		expect(router.state.location.search).toEqual({ redirect: '/bookings' });
		expect(bookingRequests).toBe(0);
	});

	it('invites to browse cars when there are no bookings', async () => {
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () => HttpResponse.json(page([]))),
		);
		renderApp('/bookings');

		expect(
			await screen.findByRole('heading', { name: 'You have no bookings yet.' }),
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Browse cars' })).toHaveAttribute(
			'href',
			'/cars',
		);
	});

	it('cancels a booking only after confirmation and announces the result', async () => {
		let listRequests = 0;
		let cancelRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () => {
				listRequests += 1;
				return HttpResponse.json(
					page([
						listRequests === 1
							? makeBooking()
							: makeBooking({ status: 'cancelled', can_cancel: false }),
					]),
				);
			}),
			http.patch('/api/bookings/7/cancel', () => {
				cancelRequests += 1;
				return HttpResponse.json(
					resource(makeBooking({ status: 'cancelled', can_cancel: false })),
				);
			}),
		);
		const { user } = renderApp('/bookings');

		await user.click(await screen.findByRole('button', { name: CANCEL_NAME }));

		const confirm = screen.getByRole('button', { name: 'Yes, cancel' });
		expect(confirm).toHaveFocus();
		expect(cancelRequests).toBe(0);

		await user.click(confirm);

		const status = await screen.findByRole('status');
		expect(status).toHaveTextContent(
			'Your Ford Mustang booking has been cancelled.',
		);
		expect(status).toHaveFocus();
		expect(cancelRequests).toBe(1);
		expect(screen.getByText('This booking was cancelled.')).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: CANCEL_NAME }),
		).not.toBeInTheDocument();
	});

	it('keeps the booking and returns focus when the user chooses Keep booking', async () => {
		let cancelRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () => HttpResponse.json(page([makeBooking()]))),
			http.patch('/api/bookings/7/cancel', () => {
				cancelRequests += 1;
				return HttpResponse.json(resource(makeBooking()));
			}),
		);
		const { user } = renderApp('/bookings');
		await user.click(await screen.findByRole('button', { name: CANCEL_NAME }));

		await user.click(screen.getByRole('button', { name: 'Keep booking' }));

		expect(screen.getByRole('button', { name: CANCEL_NAME })).toHaveFocus();
		expect(cancelRequests).toBe(0);
	});

	it('shows the server reason when the cancellation time has passed', async () => {
		const message = 'Booking can only be cancelled before pickup.';
		let listRequests = 0;
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () => {
				listRequests += 1;
				return HttpResponse.json(
					page([
						listRequests === 1
							? makeBooking()
							: makeBooking({ can_cancel: false }),
					]),
				);
			}),
			http.patch('/api/bookings/7/cancel', () =>
				HttpResponse.json(
					{
						message: 'The given data was invalid.',
						errors: { status: [message] },
					},
					{ status: 422 },
				),
			),
		);
		const { user } = renderApp('/bookings');
		await user.click(await screen.findByRole('button', { name: CANCEL_NAME }));

		await user.click(screen.getByRole('button', { name: 'Yes, cancel' }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent(message);
		expect(alert).toHaveFocus();
		expect(
			screen.getByText('The cancellation time for this booking has passed.'),
		).toBeInTheDocument();
	});

	it('signs the user out and redirects to sign in when the session expired', async () => {
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () =>
				HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
			),
		);
		const { router } = renderApp('/bookings');

		await screen.findByLabelText('Email address');

		expect(router.state.location.pathname).toBe('/login');
		expect(router.state.location.search).toEqual({ redirect: '/bookings' });
		const navigation = screen.getByRole('navigation', {
			name: 'Main navigation',
		});
		expect(
			within(navigation).getByRole('link', { name: 'Sign in' }),
		).toBeInTheDocument();
	});

	it('moves focus to the list heading after switching to the next page', async () => {
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', ({ request }) => {
				if (new URL(request.url).searchParams.get('page') === '2') {
					return HttpResponse.json(
						page([makeBooking({ id: 8 })], {
							current_page: 2,
							last_page: 2,
							total: 2,
						}),
					);
				}
				return HttpResponse.json(
					page([makeBooking()], { current_page: 1, last_page: 2, total: 2 }),
				);
			}),
		);
		const { user } = renderApp('/bookings');

		await user.click(await screen.findByRole('link', { name: 'Next' }));

		await screen.findByText('Page 2 of 2');
		expect(
			screen.getByRole('heading', { level: 2, name: 'Bookings' }),
		).toHaveFocus();
		expect(
			screen.queryByRole('link', { name: 'Next' }),
		).not.toBeInTheDocument();
	});
});
