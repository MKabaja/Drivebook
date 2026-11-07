import { backend } from '@/shared/api/backend';
import { type Pagination, pageOf, resourceOf } from '@/shared/api/envelopes';
import {
	type Booking,
	bookingSchema,
} from '@/features/bookings/model/booking.schemas';

type BookingPage = { bookings: Booking[]; pagination: Pagination };

const bookingPageSchema = pageOf(bookingSchema);
const bookingResourceSchema = resourceOf(bookingSchema);

async function fetchBookings(
	page: number | undefined,
	signal: AbortSignal,
): Promise<BookingPage> {
	const query = page === undefined ? '' : `?page=${page}`;
	const response = await backend.get(`/api/bookings${query}`, { signal });
	const { data, meta } = bookingPageSchema.parse(response);
	return { bookings: data, pagination: meta };
}

async function cancelBooking(bookingId: number): Promise<Booking> {
	const response = await backend.patch(`/api/bookings/${bookingId}/cancel`);
	return bookingResourceSchema.parse(response).data;
}

export type { BookingPage };
export { cancelBooking, fetchBookings };
