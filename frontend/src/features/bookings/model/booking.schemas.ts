import { z } from 'zod';

import { carSchema } from '@/features/cars/model/car.schemas';

type BookingStatus = z.infer<typeof bookingStatusSchema>;
type Booking = z.infer<typeof bookingSchema>;
type BookingRequest = {
	car_id: number;
	starts_on: string;
	ends_on: string;
	expected_daily_rate_in_grosze: number;
};

const bookingStatusSchema = z.enum(['confirmed', 'cancelled']);

const bookingSchema = z.object({
	id: z.number().int().positive(),
	car_id: z.number().int().positive(),
	starts_on: z.iso.date(),
	ends_on: z.iso.date(),
	status: bookingStatusSchema,
	daily_rate_in_grosze: z.number().int().positive(),
	total_price_in_grosze: z.number().int().positive(),
	rental_days: z.number().int().positive(),
	can_cancel: z.boolean(),
	car: carSchema,
});

export type { Booking, BookingRequest, BookingStatus };
export { bookingSchema };
