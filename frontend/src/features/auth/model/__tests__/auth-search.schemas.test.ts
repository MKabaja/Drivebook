import { describe, expect, it } from 'vitest';

import { authSearchSchema } from '@/features/auth/model/auth-search.schemas';

describe('authSearchSchema', () => {
	it('falls back to the catalog for a non-string redirect', () => {
		expect(authSearchSchema.parse({ redirect: 42 })).toEqual({
			redirect: '/cars',
		});
	});

	it('falls back to the catalog when redirect is missing', () => {
		expect(authSearchSchema.parse({})).toEqual({ redirect: '/cars' });
	});
});
