import { z } from 'zod';

type Transmission = z.infer<typeof transmissionSchema>;
type CarCategory = z.infer<typeof carCategorySchema>;
type RentalPrice = z.infer<typeof rentalPriceSchema>;
type Car = z.infer<typeof carSchema>;

const transmissionSchema = z.enum(['manual', 'automatic']);

const carCategorySchema = z.enum([
	'city',
	'compact',
	'family',
	'suv',
	'van',
	'premium',
	'sport',
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
	image_url: z.string().startsWith('/'),
	image_srcset: z.string().min(1),
	price: rentalPriceSchema.optional(),
	is_available: z.boolean().optional(),
	alternative_dates: rentalPriceSchema.nullable().optional(),
});

export type { Car, CarCategory, RentalPrice, Transmission };
export { carSchema, rentalPriceSchema, transmissionSchema };
