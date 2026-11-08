import { z } from 'zod';

import { SEAT_OPTIONS } from '@/features/cars/model/car.constants';
import { transmissionSchema } from '@/features/cars/model/car.schemas';

type RentalDatesSearch = z.infer<typeof rentalDatesSearchSchema>;
type CarSearch = z.infer<typeof carSearchSchema>;
type CarFilterValues = Record<CarFilterField, string>;
type CarFilterField = Exclude<keyof CarSearch, 'page'>;

const rentalDatesSearchSchema = z.object({
	starts_on: z.iso.date().optional().catch(undefined),
	ends_on: z.iso.date().optional().catch(undefined),
});

const carSearchSchema = rentalDatesSearchSchema.extend({
	seats: z.literal(SEAT_OPTIONS).optional().catch(undefined),
	transmission: transmissionSchema.optional().catch(undefined),
	page: z.number().int().positive().optional().catch(undefined),
});

export type { CarFilterField, CarFilterValues, CarSearch, RentalDatesSearch };
export { carSearchSchema, rentalDatesSearchSchema };
