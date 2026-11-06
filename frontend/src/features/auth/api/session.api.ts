import { fetchCurrentUser } from '@/features/auth/api/auth.api';
import type { User } from '@/features/auth/model/user.schemas';

type Session = {
	loadUser: (signal: AbortSignal) => Promise<User | null>;
	setUser: (user: User | null) => void;
};

/**
 * Pamięta użytkownika po pierwszym `loadUser` — kolejne nawigacje nie pytają API.
 * Po logowaniu i wylogowaniu wywołaj `setUser`, a potem `router.invalidate()`.
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
