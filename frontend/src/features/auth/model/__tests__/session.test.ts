import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { fetchCurrentUser } from '@/features/auth/api/auth.api';
import { createSession } from '@/features/auth/model/session';

import { makeUser } from '@/test/factories/user.factory';
import { resource } from '@/test/msw/envelopes';
import { signedInAs } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

describe('createSession', () => {
	it('asks the API for the user once and reuses the answer', async () => {
		const user = makeUser();
		let userRequests = 0;
		server.use(
			http.get('/api/user', () => {
				userRequests += 1;
				return HttpResponse.json(resource(user));
			}),
		);
		const session = createSession(fetchCurrentUser);

		const first = await session.loadUser(newSignal());
		const second = await session.loadUser(newSignal());

		expect(first).toEqual(user);
		expect(second).toEqual(user);
		expect(userRequests).toBe(1);
	});

	it('resolves null when the API answers 401', async () => {
		const session = createSession(fetchCurrentUser);

		const result = await session.loadUser(newSignal());

		expect(result).toBeNull();
	});

	it('resolves null without calling the API after setUser(null)', async () => {
		let userRequests = 0;
		server.use(
			http.get('/api/user', () => {
				userRequests += 1;
				return HttpResponse.json(resource(makeUser()));
			}),
		);
		const session = createSession(fetchCurrentUser);
		session.setUser(null);

		const result = await session.loadUser(newSignal());

		expect(result).toBeNull();
		expect(userRequests).toBe(0);
	});

	it('does not cache a failed load and asks the API again', async () => {
		const user = makeUser();
		server.use(
			http.get('/api/user', () => HttpResponse.error(), { once: true }),
			signedInAs(user),
		);
		const session = createSession(fetchCurrentUser);

		await session.loadUser(newSignal()).catch(() => undefined);
		const result = await session.loadUser(newSignal());

		expect(result).toEqual(user);
	});
});

function newSignal(): AbortSignal {
	return new AbortController().signal;
}
