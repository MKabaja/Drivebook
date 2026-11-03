import { z } from 'zod';
import { ApiError, initializeCsrf, request } from '../../shared/api/client';

export const userSchema = z.object({ id: z.number().int(), name: z.string(), email: z.string() });
const userResponseSchema = z.object({ data: userSchema });
export type User = z.infer<typeof userSchema>;
export type Credentials = { email: string; password: string };
export type Registration = Credentials & { name: string; password_confirmation: string };

export async function fetchCurrentUser(signal?: AbortSignal): Promise<User | null> {
  try {
    return userResponseSchema.parse(await request('/api/user', { signal })).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function login(credentials: Credentials): Promise<User> {
  await initializeCsrf();
  return userResponseSchema.parse(
    await request('/api/login', { method: 'POST', body: credentials })
  ).data;
}

export async function register(registration: Registration): Promise<User> {
  await initializeCsrf();
  return userResponseSchema.parse(
    await request('/api/register', { method: 'POST', body: registration })
  ).data;
}

export async function logout(): Promise<void> {
  try {
    await request('/api/logout', { method: 'POST' });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) throw error;
  }
}

export function safeRedirect(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return '/rooms';
  const target = new URL(value, 'https://roombook.local');
  if (!['/rooms', '/bookings', '/bookings/new'].includes(target.pathname)) return '/rooms';
  return `${target.pathname}${target.search}`;
}
