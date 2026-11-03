import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { fetchBookings } from '../features/bookings/api';
import { BookingsPage } from '../features/bookings/bookings-page';
export const Route = createFileRoute('/_authenticated/bookings/')({
  validateSearch: z.object({ page: z.number().int().positive().catch(1) }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps, abortController }) => fetchBookings(deps.page, abortController.signal),
  component: BookingsRoute
});
function BookingsRoute() {
  const result = Route.useLoaderData();
  return (
    <BookingsPage
      bookings={result.data}
      currentPage={result.current_page}
      lastPage={result.last_page}
      total={result.total}
    />
  );
}
