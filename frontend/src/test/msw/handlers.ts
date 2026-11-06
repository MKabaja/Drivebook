import { HttpResponse, http } from 'msw';

import type { User } from '@/features/auth/model/user.schemas';

import { resource } from '@/test/msw/envelopes';

/**
 * Endpointy, które trafia każda strona: gość bez sesji i pobranie ciasteczka CSRF.
 */
const defaultHandlers = [
	http.get('/api/user', () =>
		HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
	),
	http.get(
		'/sanctum/csrf-cookie',
		() => new HttpResponse(null, { status: 204 }),
	),
];

/**
 * Handler do `server.use(...)`: `GET /api/user` zwraca zalogowanego użytkownika zamiast 401.
 */
function signedInAs(user: User) {
	return http.get('/api/user', () => HttpResponse.json(resource(user)));
}

export { defaultHandlers, signedInAs };
