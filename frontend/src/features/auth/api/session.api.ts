import { fetchCurrentUser } from '@/features/auth/api/auth.api';
import type { User } from '@/features/auth/model/user.schemas';

type Session = {
	loadUser: (signal: AbortSignal) => Promise<User | null>;
	setUser: (user: User | null) => void;
};

/**
 * Creates a session that remembers the user after the first `loadUser`, so later navigations skip the API.
 * After sign-in and sign-out call `setUser`, then `router.invalidate()`.
 */
function createSession(): Session {
	let knownUser: User | null | undefined;

	async function loadUser(signal: AbortSignal): Promise<User | null> {
		if (knownUser === undefined) {
			knownUser = await fetchCurrentUser(signal);
		}
		return knownUser;
	}

	function setUser(user: User | null): void {
		knownUser = user;
	}

	return { loadUser, setUser };
}

export type { Session };
export { createSession };
