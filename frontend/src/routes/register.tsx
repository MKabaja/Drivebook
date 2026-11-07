import { createFileRoute, redirect } from '@tanstack/react-router';

import { AuthPage } from '@/features/auth/components/auth-page/auth-page';
import { authSearchSchema } from '@/features/auth/model/auth-search.schemas';

function RegisterPage() {
	const { redirect } = Route.useSearch();
	return <AuthPage mode="register" redirectTo={redirect} />;
}

export const Route = createFileRoute('/register')({
	validateSearch: authSearchSchema,
	beforeLoad: ({ context, search }) => {
		if (context.user !== null) {
			throw redirect({ href: search.redirect });
		}
	},
	component: RegisterPage,
});
