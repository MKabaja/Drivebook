import { z } from 'zod';

function resourceOf<Schema extends z.ZodType>(schema: Schema) {
	return z.object({ data: schema });
}

export { resourceOf };
