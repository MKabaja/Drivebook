import { createRouter } from '@tanstack/react-router';

import { fetchCurrentUser } from '@/features/auth/api/auth.api';
import { createSession } from '@/features/auth/model/session';

import { routeTree } from '@/routeTree.gen';

const router = createRouter({
	routeTree,
	context: { session: createSession(fetchCurrentUser) },
	defaultPreload: false,
	defaultStaleTime: 0,
	defaultGcTime: 0,
	scrollRestoration: true,
});

declare module '@tanstack/react-router' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: module augmentation requires an interface
	interface Register {
		router: typeof router;
	}
}

export { router };
