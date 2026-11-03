import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { safeRedirect } from '../features/auth/api';
import { AuthPage } from '../features/auth/auth-page';
export const Route = createFileRoute('/register')({
  validateSearch: z.object({ redirect: z.string().optional().transform(safeRedirect) }),
  component: RegisterPage
});
function RegisterPage() {
  const { redirect } = Route.useSearch();
  return <AuthPage mode="register" redirectTo={redirect} />;
}
