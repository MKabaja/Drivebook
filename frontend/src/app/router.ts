import { createRouter } from '@tanstack/react-router';

import { createSession } from '@/features/auth/api/session.api';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({
	routeTree,
	context: { session: createSession() },
	defaultPreload: false,
	defaultStaleTime: 0,
	defaultGcTime: 0,
	scrollRestoration: true,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

export { router };
