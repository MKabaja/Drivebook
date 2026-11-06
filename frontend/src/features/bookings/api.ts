import { z } from 'zod';
import { request } from '../../shared/api/client';
import { roomSchema } from '../rooms/api';
export const bookingSchema = z.object({
	id: z.number().int(),
	room_id: z.number().int(),
	room: roomSchema.optional(),
	starts_at: z.string(),
	ends_at: z.string(),
	participants_count: z.number().int(),
	status: z.enum(['pending', 'confirmed', 'cancelled']),
});
const bookingsSchema = z.object({
	data: z.array(bookingSchema),
	current_page: z.number().int(),
	last_page: z.number().int(),
	total: z.number().int(),
});
export type Booking = z.infer<typeof bookingSchema>;
export type BookingInput = {
	room_id: number;
	starts_at: string;
	ends_at: string;
	participants_count: number;
};
export async function fetchBookings(page: number, signal?: AbortSignal) {
	return bookingsSchema.parse(
		await request(`/api/bookings?page=${page}`, { signal }),
	);
}
export async function createBooking(booking: BookingInput): Promise<Booking> {
	return bookingSchema.parse(
		await request('/api/bookings', { method: 'POST', body: booking }),
	);
}
export async function cancelBooking(id: number): Promise<void> {
	bookingSchema.parse(
		await request(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
	);
}
export function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat('pl-PL', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
}
