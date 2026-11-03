import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { routeTree } from '../../routeTree.gen';

const account = { data: { id: 1, name: 'Test', email: 'test@example.com' } };
const room = { id: 1, name: 'Sala Fokus', capacity: 8 };
const booking = {
  id: 1,
  room_id: 1,
  room,
  starts_at: '2030-12-01T10:00:00Z',
  ends_at: '2030-12-01T11:00:00Z',
  participants_count: 3,
  status: 'pending'
};
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
function renderPath(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultStaleTime: 0,
    defaultGcTime: 0
  });
  render(<RouterProvider router={router} />);
  return router;
}
it('shows server field validation after a reservation fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) => {
      if (path === '/api/user') return json(account);
      if (path === '/api/rooms') return json([room]);
      if (path === '/api/bookings')
        return json(
          { message: 'Termin jest zajęty.', errors: { starts_at: ['Wybierz inny termin.'] } },
          422
        );
      throw Error(`Unexpected request ${path}`);
    })
  );
  const user = userEvent.setup();
  renderPath('/bookings/new?roomId=1');
  await screen.findByRole('heading', { name: 'Zarezerwuj swoją przestrzeń.' });
  const starts = screen.getByLabelText('Początek spotkania');
  const ends = screen.getByLabelText('Koniec spotkania');
  await user.type(starts, '2030-12-01T10:00');
  await user.type(ends, '2030-12-01T11:00');
  await user.click(screen.getByRole('button', { name: 'Zarezerwuj salę' }));
  expect(await screen.findByText('Wybierz inny termin.')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Termin jest zajęty.');
});
it('refreshes the reservation after successful cancellation', async () => {
  let cancelled = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string) => {
      if (path === '/api/user') return json(account);
      if (path === '/api/bookings?page=1')
        return json({
          data: [{ ...booking, status: cancelled ? 'cancelled' : 'pending' }],
          current_page: 1,
          last_page: 1,
          total: 1
        });
      if (path === '/api/bookings/1/cancel') {
        cancelled = true;
        return json({ ...booking, status: 'cancelled' });
      }
      throw Error(`Unexpected request ${path}`);
    })
  );
  const user = userEvent.setup();
  renderPath('/bookings?page=1');
  const title = await screen.findByRole('heading', { name: 'Sala Fokus' });
  const card = title.closest('li');
  if (!card) throw Error('Missing booking card');
  await user.click(within(card).getByRole('button', { name: 'Anuluj rezerwację Sala Fokus' }));
  expect(await within(card).findByText('Anulowana')).toBeInTheDocument();
  expect(within(card).queryByRole('button', { name: /Anuluj/ })).not.toBeInTheDocument();
});
