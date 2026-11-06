import { describe, expect, it } from 'vitest';

import { userSchema } from '@/features/auth/model/user.schemas';
import { makeUser } from '@/test/factories/user.factory';

describe('makeUser', () => {
	it('builds a user that satisfies the user schema', () => {
		expect(userSchema.parse(makeUser())).toEqual(makeUser());
	});
});
