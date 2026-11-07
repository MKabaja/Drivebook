import type { User } from '@/features/auth/model/user.schemas';

type UserOverrides = Partial<User>;

function makeUser(overrides: UserOverrides = {}): User {
	return {
		id: 1,
		name: 'Demo Driver',
		email: 'demo@drivebook.test',
		...overrides,
	};
}

export { makeUser };
