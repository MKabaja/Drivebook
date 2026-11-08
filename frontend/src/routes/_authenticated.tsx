import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
	beforeLoad: ({ context, location }) => {
		if (context.user === null) {
			throw redirect({ to: '/login', search: { redirect: location.href } });
		}
		return { user: context.user };
	},
});
