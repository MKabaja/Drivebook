import {
	createMemoryHistory,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { fetchCurrentUser } from '@/features/auth/api/auth.api';
import { createSession } from '@/features/auth/model/session';

import { routeTree } from '@/routeTree.gen';

/**
 * Renders the whole app on a real router with in-memory history, starting at `path`.
 * Each call creates a new session, so tests never share a signed-in user.
 */
function renderApp(path: string) {
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [path] }),
		context: { session: createSession(fetchCurrentUser) },
	});
	render(<RouterProvider router={router} />);
	return { router, user: userEvent.setup() };
}

export { renderApp };
