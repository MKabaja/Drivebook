import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { HttpError } from '@/shared/api/http-error';
import { logout } from '@/features/auth/api/auth.api';

import { server } from '@/test/msw/server';

describe('logout', () => {
	it('refreshes the CSRF cookie and retries once after a 419', async () => {
		let logoutRequests = 0;
		let csrfRequests = 0;
		server.use(
			http.post('/api/logout', () => {
				logoutRequests += 1;
				return logoutRequests === 1
					? HttpResponse.json(
							{ message: 'CSRF token mismatch.' },
							{ status: 419 },
						)
					: new HttpResponse(null, { status: 204 });
			}),
			http.get('/sanctum/csrf-cookie', () => {
				csrfRequests += 1;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await expect(logout()).resolves.toBeUndefined();

		expect(logoutRequests).toBe(2);
		expect(csrfRequests).toBe(1);
	});

	it('rejects after a second 419 without looping', async () => {
		let logoutRequests = 0;
		server.use(
			http.post('/api/logout', () => {
				logoutRequests += 1;
				return HttpResponse.json(
					{ message: 'CSRF token mismatch.' },
					{ status: 419 },
				);
			}),
		);

		await expect(logout()).rejects.toMatchObject({
			constructor: HttpError,
			status: 419,
		});

		expect(logoutRequests).toBe(2);
	});

	it('resolves on 401 without touching the CSRF cookie', async () => {
		let logoutRequests = 0;
		let csrfRequests = 0;
		server.use(
			http.post('/api/logout', () => {
				logoutRequests += 1;
				return HttpResponse.json(
					{ message: 'Unauthenticated.' },
					{ status: 401 },
				);
			}),
			http.get('/sanctum/csrf-cookie', () => {
				csrfRequests += 1;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await expect(logout()).resolves.toBeUndefined();

		expect(logoutRequests).toBe(1);
		expect(csrfRequests).toBe(0);
	});
});
