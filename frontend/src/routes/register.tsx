import { createFileRoute } from '@tanstack/react-router';

import { AuthPage } from '@/features/auth/components/auth-page/auth-page';
import { authSearchSchema } from '@/features/auth/model/auth-search.schemas';

function RegisterPage() {
	const { redirect } = Route.useSearch();
	return <AuthPage mode="register" redirectTo={redirect} />;
}

export const Route = createFileRoute('/register')({
	validateSearch: authSearchSchema,
	component: RegisterPage,
});
