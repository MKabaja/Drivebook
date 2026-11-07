import { z } from 'zod';

type BookingSearch = z.infer<typeof bookingSearchSchema>;

const bookingSearchSchema = z.object({
	page: z.number().int().positive().optional().catch(undefined),
});

export type { BookingSearch };
export { bookingSearchSchema };
