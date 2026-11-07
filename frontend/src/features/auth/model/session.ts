import type { User } from '@/features/auth/model/user.schemas';

type FetchUser = (signal: AbortSignal) => Promise<User | null>;
type Session = {
	loadUser: (signal: AbortSignal) => Promise<User | null>;
	setUser: (user: User | null) => void;
};

/**
 * Creates a session that remembers the user after the first `loadUser`, so later navigations skip the API.
 * A failed `fetchUser` is not remembered. After sign-in and sign-out call `setUser`.
 */
function createSession(fetchUser: FetchUser): Session {
	let knownUser: User | null | undefined;

	async function loadUser(signal: AbortSignal): Promise<User | null> {
		if (knownUser === undefined) {
			knownUser = await fetchUser(signal);
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
