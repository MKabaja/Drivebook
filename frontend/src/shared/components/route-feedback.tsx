import type { ErrorComponentProps } from '@tanstack/react-router';
import { Link, useRouter } from '@tanstack/react-router';
import { ApiError, errorMessage } from '../api/client';
import { uiStyles as s } from './ui.styles';
export function RoutePending() {
  return (
    <div className={`${s.shell} ${s.page}`} role="status">
      Ładowanie…
    </div>
  );
}
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  async function handleRetry() {
    await router.invalidate();
    reset();
  }
  return (
    <main id="main" className={`${s.shell} ${s.page}`}>
      <h1 className={s.title}>Nie udało się wczytać strony</h1>
      <p className={s.lead} role="alert">
        {errorMessage(error)}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {error instanceof ApiError && error.status === 401 ? (
          <Link to="/login" search={{ redirect: '/rooms' }} className={s.primary}>
            Zaloguj się
          </Link>
        ) : (
          <button type="button" onClick={handleRetry} className={s.primary}>
            Spróbuj ponownie
          </button>
        )}
        <Link to="/" className={s.secondary}>
          Strona główna
        </Link>
      </div>
    </main>
  );
}
export function NotFoundPage() {
  return (
    <main id="main" className={`${s.shell} ${s.page}`}>
      <h1 className={s.title}>Nie ma takiej strony</h1>
      <Link to="/" className={`${s.primary} mt-6`}>
        Wróć na stronę główną
      </Link>
    </main>
  );
}
