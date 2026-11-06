import { describe, expect, it, vi } from 'vitest';

import { backend } from '@/shared/api/backend';
import { HttpError } from '@/shared/api/http-error';
import { NetworkError } from '@/shared/api/network-error';

const XSRF_COOKIE = 'XSRF-TOKEN=token%3D';

describe('backend', () => {
	it('rejects a 419 POST with an HttpError without a body and does not retry', async () => {
		const fetchMock = stubFetch(
			new Response('<html>Expired</html>', { status: 419 }),
		);

		const rejection = expect(backend.post('/api/bookings', {})).rejects;

		await rejection.toBeInstanceOf(HttpError);
		await rejection.toMatchObject({ status: 419, body: undefined });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('sends the decoded XSRF token and same-origin credentials on POST and resolves undefined for 204', async () => {
		vi.spyOn(document, 'cookie', 'get').mockReturnValue(XSRF_COOKIE);
		const fetchMock = stubFetch(new Response(null, { status: 204 }));

		const result = await backend.post('/api/logout');

		const headers = readHeaders(fetchMock);
		expect(result).toBeUndefined();
		expect(readRequestInit(fetchMock)).toMatchObject({
			credentials: 'same-origin',
			method: 'POST',
		});
		expect(headers.get('X-XSRF-TOKEN')).toBe('token=');
		expect(headers.get('Accept')).toBe('application/json');
	});

	it('sends a JSON body with a JSON content type on POST', async () => {
		const fetchMock = stubFetch(jsonResponse({}, 200));

		await backend.post('/api/login', { email: 'a@b.test' });

		expect(readRequestInit(fetchMock).body).toBe('{"email":"a@b.test"}');
		expect(readHeaders(fetchMock).get('Content-Type')).toBe('application/json');
	});

	it('sends neither the XSRF token nor a content type on GET', async () => {
		vi.spyOn(document, 'cookie', 'get').mockReturnValue(XSRF_COOKIE);
		const fetchMock = stubFetch(jsonResponse({}, 200));

		await backend.get('/api/cars');

		const headers = readHeaders(fetchMock);
		expect(headers.has('X-XSRF-TOKEN')).toBe(false);
		expect(headers.has('Content-Type')).toBe(false);
	});

	it('rejects a 422 with an HttpError carrying the parsed JSON body', async () => {
		const body = { message: 'Invalid.', errors: { email: ['Taken.'] } };
		stubFetch(jsonResponse(body, 422));

		const rejection = expect(backend.post('/api/register', {})).rejects;

		await rejection.toBeInstanceOf(HttpError);
		await rejection.toMatchObject({ status: 422, body });
	});

	it('resolves with the parsed JSON body on 200', async () => {
		stubFetch(jsonResponse({ data: { id: 1 } }, 200));

		const result = await backend.get('/api/cars/1');

		expect(result).toEqual({ data: { id: 1 } });
	});

	it('rejects with a NetworkError when fetch fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
		);

		await expect(backend.get('/api/cars')).rejects.toBeInstanceOf(NetworkError);
	});

	it('rethrows the original abort error for an aborted request', async () => {
		const controller = new AbortController();
		controller.abort();
		const abortError = new DOMException('Aborted', 'AbortError');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

		await expect(
			backend.get('/api/user', { signal: controller.signal }),
		).rejects.toBe(abortError);
	});
});

function stubFetch(response: Response) {
	const fetchMock = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

function jsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), { status });
}

function readRequestInit(fetchMock: ReturnType<typeof vi.fn>): RequestInit {
	return fetchMock.mock.calls[0][1];
}

function readHeaders(fetchMock: ReturnType<typeof vi.fn>): Headers {
	return new Headers(readRequestInit(fetchMock).headers);
}
