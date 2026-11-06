import { createRootRouteWithContext } from '@tanstack/react-router';

import { RootLayout } from '@/app/layouts/root-layout';
import type { Session } from '@/features/auth/api/session.api';
import {
	NotFoundPage,
	RouteError,
	RoutePending,
} from '@/shared/components/route-feedback/route-feedback';

type RouterContext = { session: Session };

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context, abortController }) => ({
		user: await context.session.loadUser(abortController.signal),
	}),
	component: RootLayout,
	pendingComponent: RoutePending,
	errorComponent: RouteError,
	notFoundComponent: NotFoundPage,
});
