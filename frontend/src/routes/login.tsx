import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { safeRedirect } from '../features/auth/api';
import { AuthPage } from '../features/auth/auth-page';
export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional().transform(safeRedirect) }),
  component: LoginPage
});
function LoginPage() {
  const { redirect } = Route.useSearch();
  return <AuthPage mode="login" redirectTo={redirect} />;
}
