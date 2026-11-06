import { createRootRoute } from '@tanstack/react-router';
import { Layout } from '../app/layout';
import { fetchCurrentUser } from '../features/auth/api';
import {
	NotFoundPage,
	RouteError,
	RoutePending,
} from '../shared/components/route-feedback';
export const Route = createRootRoute({
	beforeLoad: async ({ abortController }) => ({
		user: await fetchCurrentUser(abortController.signal),
	}),
	component: Layout,
	pendingComponent: RoutePending,
	errorComponent: RouteError,
	notFoundComponent: NotFoundPage,
});
