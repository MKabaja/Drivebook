import { createFileRoute, redirect } from '@tanstack/react-router';

import { HttpError } from '@/shared/api/http-error';
import { RouteError } from '@/shared/components/route-feedback/route-feedback';
import { fetchBookings } from '@/features/bookings/api/bookings.api';
import { bookingSearchSchema } from '@/features/bookings/model/booking-search.schemas';
import { BookingsPage } from '@/features/bookings/pages/bookings-page';

function BookingsRoute() {
	const { booked } = Route.useSearch();
	return (
		<BookingsPage
			bookingPage={Route.useLoaderData()}
			isJustBooked={booked !== undefined}
		/>
	);
}

export const Route = createFileRoute('/_authenticated/bookings')({
	validateSearch: bookingSearchSchema,
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: async ({ deps, context, location, abortController }) => {
		try {
			const bookingPage = await fetchBookings(
				deps.page,
				abortController.signal,
			);
			const { current_page, last_page } = bookingPage.pagination;
			if (current_page > last_page) {
				throw redirect({
					to: '/bookings',
					search: { page: last_page > 1 ? last_page : undefined },
				});
			}
			return bookingPage;
		} catch (error) {
			if (error instanceof HttpError && error.status === 401) {
				context.session.setUser(null);
				throw redirect({ to: '/login', search: { redirect: location.href } });
			}
			throw error;
		}
	},
	component: BookingsRoute,
	errorComponent: RouteError,
});
