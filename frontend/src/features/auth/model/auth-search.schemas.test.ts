import { describe, expect, it } from 'vitest';

import { authSearchSchema } from '@/features/auth/model/auth-search.schemas';

describe('authSearchSchema', () => {
	it('falls back to the home path for a non-string redirect', () => {
		expect(authSearchSchema.parse({ redirect: 42 })).toEqual({ redirect: '/' });
	});

	it('falls back to the home path when redirect is missing', () => {
		expect(authSearchSchema.parse({})).toEqual({ redirect: '/' });
	});
});
