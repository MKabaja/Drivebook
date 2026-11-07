import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeCar, makeRentalPrice } from '@/test/factories/car.factory';
import { page } from '@/test/msw/envelopes';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/utils/render-app';

const twoCars = [
	makeCar(),
	makeCar({ id: 7, name: 'Ferrari 458 Italia', seats: 2 }),
];

function recordCarRequests(
	respond: (requestNumber: number) => ReturnType<typeof page>,
) {
	const requests: URLSearchParams[] = [];
	server.use(
		http.get('/api/cars', ({ request }) => {
			requests.push(new URL(request.url).searchParams);
			return HttpResponse.json(respond(requests.length));
		}),
	);
	return requests;
}

describe('catalog page', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
		vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('puts the filters in the URL and loads the matching cars', async () => {
		const requests = recordCarRequests((requestNumber) =>
			requestNumber === 1
				? page(twoCars)
				: page([makeCar({ price: makeRentalPrice(), is_available: true })]),
		);
		const { router, user } = renderApp('/cars');
		expect(await screen.findByText('2 cars found')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Pick-up date'), '2026-11-10');
		await user.type(screen.getByLabelText('Return date'), '2026-11-13');
		await user.selectOptions(screen.getByLabelText('Seats'), '4');
		await user.selectOptions(screen.getByLabelText('Transmission'), 'manual');
		await user.click(screen.getByRole('button', { name: 'Search' }));

		expect(await screen.findByText('1 car found')).toBeInTheDocument();
		const lastRequest = requests[requests.length - 1];
		expect(Object.fromEntries(lastRequest ?? [])).toEqual({
			starts_on: '2026-11-10',
			ends_on: '2026-11-13',
			seats: '4',
			transmission: 'manual',
		});
		expect(lastRequest?.has('page')).toBe(false);
		expect(router.state.location.search).toEqual({
			starts_on: '2026-11-10',
			ends_on: '2026-11-13',
			seats: 4,
			transmission: 'manual',
		});
		expect(screen.getByText('PLN 1,347 for 3 days')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
	});

	it('shows a date error without sending a request when only one date is chosen', async () => {
		const requests = recordCarRequests(() => page(twoCars));
		const { router, user } = renderApp('/cars');
		expect(await screen.findByText('2 cars found')).toBeInTheDocument();

		await user.type(screen.getByLabelText('Pick-up date'), '2026-11-10');
		await user.click(screen.getByRole('button', { name: 'Search' }));

		const returnDate = screen.getByLabelText('Return date');
		expect(returnDate).toHaveAttribute('aria-invalid', 'true');
		expect(returnDate).toHaveAccessibleDescription('Choose a return date.');
		expect(returnDate).toHaveFocus();
		expect(requests).toHaveLength(1);
		expect(router.state.location.search).toEqual({});
	});

	it('resets the filters from the empty state', async () => {
		const requests = recordCarRequests((requestNumber) =>
			requestNumber === 1 ? page([]) : page(twoCars),
		);
		const { user } = renderApp('/cars?seats=7&transmission=manual');
		expect(
			await screen.findByRole('heading', {
				name: 'No car matches your filters.',
			}),
		).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('0 cars found');

		const emptyStateClearLink = screen
			.getAllByRole('link', { name: 'Clear filters' })
			.at(-1);
		if (emptyStateClearLink === undefined) {
			throw new Error('Clear filters link not found');
		}
		await user.click(emptyStateClearLink);

		expect(await screen.findByText('2 cars found')).toBeInTheDocument();
		expect(requests[requests.length - 1]?.size).toBe(0);
		expect(screen.getByLabelText('Seats')).toHaveValue('');
		expect(screen.getByLabelText('Transmission')).toHaveValue('');
	});

	it('drops outdated dates from a shared link', async () => {
		const requests = recordCarRequests(() => page(twoCars));
		renderApp('/cars?starts_on=2020-01-01&ends_on=2020-01-03&seats=4');

		expect(await screen.findByText('2 cars found')).toBeInTheDocument();

		expect(requests).toHaveLength(1);
		expect(requests[0]?.get('seats')).toBe('4');
		expect(requests[0]?.has('starts_on')).toBe(false);
		expect(requests[0]?.has('ends_on')).toBe(false);
		expect(screen.getByLabelText('Pick-up date')).toHaveValue('');
		expect(screen.getByLabelText('Return date')).toHaveValue('');
	});

	it('keeps the page number in the URL', async () => {
		const requests = recordCarRequests((requestNumber) =>
			requestNumber === 1
				? page([makeCar()], { current_page: 1, last_page: 2, total: 13 })
				: page([makeCar({ id: 7, name: 'Ferrari 458 Italia' })], {
						current_page: 2,
						last_page: 2,
						total: 13,
					}),
		);
		const { user } = renderApp('/cars');
		const pager = await screen.findByRole('navigation', { name: 'Car pages' });

		await user.click(within(pager).getByRole('link', { name: 'Next' }));

		expect(await screen.findByText('Ferrari 458 Italia')).toBeInTheDocument();
		expect(requests[requests.length - 1]?.get('page')).toBe('2');
		expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
		expect(
			screen.queryByRole('link', { name: 'Next' }),
		).not.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Previous' })).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: 'Cars', level: 2 }),
		).toHaveFocus();
	});

	it('keeps the layout when the catalog fails to load', async () => {
		server.use(
			http.get('/api/cars', () => HttpResponse.json({}, { status: 500 })),
		);
		renderApp('/cars');

		expect(
			await screen.findByRole('heading', {
				name: "We couldn't load this page",
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole('navigation', { name: 'Main navigation' }),
		).toBeInTheDocument();
	});

	it('redirects a page past the end to the last page', async () => {
		const requests = recordCarRequests((requestNumber) =>
			requestNumber === 1
				? page([], { current_page: 5, last_page: 2, total: 13 })
				: page([makeCar()], { current_page: 2, last_page: 2, total: 13 }),
		);
		const { router } = renderApp('/cars?page=5');

		expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument();
		expect(requests[0]?.get('page')).toBe('5');
		expect(requests[requests.length - 1]?.get('page')).toBe('2');
		expect(router.state.location.search).toEqual({ page: 2 });
	});

	it('ignores a seat count outside the offered options', async () => {
		const requests = recordCarRequests(() => page(twoCars));
		renderApp('/cars?seats=3');

		expect(await screen.findByText('2 cars found')).toBeInTheDocument();

		expect(requests).toHaveLength(1);
		expect(requests[0]?.has('seats')).toBe(false);
		expect(screen.getByLabelText('Seats')).toHaveValue('');
	});
});
