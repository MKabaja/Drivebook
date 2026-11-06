import { backend } from '@/shared/api/backend';
import { resourceOf } from '@/shared/api/envelopes';
import { HttpError } from '@/shared/api/http-error';
import {
	type Credentials,
	type Registration,
	type User,
	userSchema,
} from '@/features/auth/model/user.schemas';

const userResourceSchema = resourceOf(userSchema);

async function fetchCurrentUser(signal: AbortSignal): Promise<User | null> {
	try {
		const response = await backend.get('/api/user', { signal });
		return userResourceSchema.parse(response).data;
	} catch (error) {
		if (isUnauthenticated(error)) {
			return null;
		}
		throw error;
	}
}

async function login(credentials: Credentials): Promise<User> {
	await prepareCsrfCookie();
	const response = await backend.post('/api/login', credentials);
	return userResourceSchema.parse(response).data;
}

async function register(registration: Registration): Promise<User> {
	await prepareCsrfCookie();
	const response = await backend.post('/api/register', registration);
	return userResourceSchema.parse(response).data;
}

async function logout(): Promise<void> {
	try {
		await backend.post('/api/logout');
	} catch (error) {
		if (!isUnauthenticated(error)) {
			throw error;
		}
	}
}

async function prepareCsrfCookie(): Promise<void> {
	await backend.get('/sanctum/csrf-cookie');
}

function isUnauthenticated(error: unknown): boolean {
	return error instanceof HttpError && error.status === 401;
}

export { fetchCurrentUser, login, logout, register };
