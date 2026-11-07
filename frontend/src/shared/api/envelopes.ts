import { z } from 'zod';

type Pagination = z.infer<typeof paginationSchema>;

const paginationSchema = z.object({
	current_page: z.number().int().positive(),
	last_page: z.number().int().positive(),
	total: z.number().int().nonnegative(),
});

function resourceOf<Schema extends z.ZodType>(schema: Schema) {
	return z.object({ data: schema });
}

function pageOf<Schema extends z.ZodType>(schema: Schema) {
	return z.object({ data: z.array(schema), meta: paginationSchema });
}

export type { Pagination };
export { pageOf, resourceOf };
