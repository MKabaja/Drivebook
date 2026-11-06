import type { User } from '@/features/auth/model/user.schemas';

function makeUser(overrides: Partial<User> = {}): User {
	return {
		id: 1,
		name: 'Demo Driver',
		email: 'demo@drivebook.test',
		...overrides,
	};
}

export { makeUser };
