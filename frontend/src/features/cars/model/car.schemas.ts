import { z } from 'zod';

type Transmission = z.infer<typeof transmissionSchema>;
type CarCategory = z.infer<typeof carCategorySchema>;
type RentalPrice = z.infer<typeof rentalPriceSchema>;
type Car = z.infer<typeof carSchema>;

const transmissionSchema = z.enum(['manual', 'automatic']);

const carCategorySchema = z.enum([
	'sport',
	'grand_tourer',
	'muscle',
	'sedan',
	'estate',
]);

const rentalPriceSchema = z.object({
	starts_on: z.iso.date(),
	ends_on: z.iso.date(),
	rental_days: z.number().int().positive(),
	daily_rate_in_grosze: z.number().int().positive(),
	total_price_in_grosze: z.number().int().positive(),
});

const carSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	seats: z.number().int().positive(),
	transmission: transmissionSchema,
	category: carCategorySchema,
	daily_rate_in_grosze: z.number().int().positive(),
	image_path: z.string().startsWith('/'),
	price: rentalPriceSchema.optional(),
	is_available: z.boolean().optional(),
});

export type { Car, CarCategory, RentalPrice, Transmission };
export { carSchema, transmissionSchema };
