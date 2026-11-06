import { HttpError } from '@/shared/api/http-error';
import { NetworkError } from '@/shared/api/network-error';

type HttpMethod = 'GET' | 'POST';
type ReadOptions = { signal?: AbortSignal };
type BackendRequest = {
	method: HttpMethod;
	body?: unknown;
	signal?: AbortSignal;
};

const XSRF_COOKIE_PREFIX = 'XSRF-TOKEN=';

const backend = { get, post };

function get(path: string, { signal }: ReadOptions = {}): Promise<unknown> {
	return send(path, { method: 'GET', signal });
}

function post(path: string, body?: unknown): Promise<unknown> {
	return send(path, { method: 'POST', body });
}

async function send(path: string, request: BackendRequest): Promise<unknown> {
	const response = await fetchOrThrow(path, request);
	const body = await readJsonBody(response);
	if (!response.ok) {
		throw new HttpError(response.status, body);
	}
	return body;
}

async function fetchOrThrow(
	path: string,
	request: BackendRequest,
): Promise<Response> {
	try {
		return await fetch(path, {
			method: request.method,
			credentials: 'same-origin',
			headers: buildHeaders(request),
			body:
				request.body === undefined ? undefined : JSON.stringify(request.body),
			signal: request.signal,
		});
	} catch (error) {
		if (request.signal?.aborted) {
			throw error;
		}
		throw new NetworkError(error);
	}
}

function buildHeaders({ method, body }: BackendRequest): Headers {
	const headers = new Headers({
		Accept: 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
	});
	if (body !== undefined) {
		headers.set('Content-Type', 'application/json');
	}
	const xsrfToken = readXsrfToken();
	if (method !== 'GET' && xsrfToken !== undefined) {
		headers.set('X-XSRF-TOKEN', xsrfToken);
	}
	return headers;
}

function readXsrfToken(): string | undefined {
	const cookie = document.cookie
		.split('; ')
		.find((part) => part.startsWith(XSRF_COOKIE_PREFIX));
	if (cookie === undefined) {
		return undefined;
	}
	return decodeURIComponent(cookie.slice(XSRF_COOKIE_PREFIX.length));
}

async function readJsonBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (text === '') {
		return undefined;
	}
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

export { backend };
