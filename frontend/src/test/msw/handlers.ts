import { HttpResponse, http } from 'msw';

import type { User } from '@/features/auth/model/user.schemas';

import { resource } from '@/test/msw/envelopes';

/**
 * Endpoints every page hits: a guest without a session and the CSRF cookie request.
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
 * Returns a handler for `server.use(...)` that makes `GET /api/user` respond with the signed-in user instead of 401.
 */
function signedInAs(user: User) {
	return http.get('/api/user', () => HttpResponse.json(resource(user)));
}

export { defaultHandlers, signedInAs };
