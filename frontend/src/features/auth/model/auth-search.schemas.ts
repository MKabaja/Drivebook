import { z } from 'zod';

import { safeRedirect } from '@/features/auth/lib/safe-redirect';

const authSearchSchema = z.object({
	redirect: z.unknown().optional().transform(safeRedirect),
});

export { authSearchSchema };
