import {
	createMemoryHistory,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createSession } from '@/features/auth/api/session.api';
import { routeTree } from '@/routeTree.gen';

/**
 * Renderuje całą aplikację na prawdziwym routerze z pamięciową historią, startując od `path`.
 * Każde wywołanie tworzy nową sesję, więc testy nie dzielą zalogowanego użytkownika.
 */
function renderApp(path: string) {
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [path] }),
		context: { session: createSession() },
	});
	render(<RouterProvider router={router} />);
	return { router, user: userEvent.setup() };
}

export { renderApp };
