import { expect, it, vi } from 'vitest';
import { request } from './client';

it('does not retry a reservation when the CSRF session expires', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('<html>Expired</html>', { status: 419 }));
  vi.stubGlobal('fetch', fetch);
  await expect(
    request('/api/bookings', { method: 'POST', body: { room_id: 1 } })
  ).rejects.toMatchObject({ status: 419, message: expect.stringContaining('Sesja wygasła') });
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('sends a decoded XSRF cookie with a mutation and handles an empty204 response', async () => {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=token%3D');
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetch);
  await expect(request('/api/logout', { method: 'POST' })).resolves.toBeUndefined();
  const options = fetch.mock.calls[0]?.[1];
  expect(options?.credentials).toBe('same-origin');
  expect(options?.headers.get('X-XSRF-TOKEN')).toBe('token=');
});
