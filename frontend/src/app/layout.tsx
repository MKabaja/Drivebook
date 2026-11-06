import {
	Link,
	Outlet,
	useRouteContext,
	useRouter,
} from '@tanstack/react-router';
import { CalendarDays, LogOut } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../features/auth/api';
import { errorMessage } from '../shared/api/client';
import { uiStyles } from '../shared/components/ui.styles';
import { layoutStyles as s } from './layout.styles';
export function Layout() {
	const { user } = useRouteContext({ from: '__root__' });
	const router = useRouter();
	const [status, setStatus] = useState<'idle' | 'pending'>('idle');
	const [error, setError] = useState('');
	async function handleLogout() {
		setStatus('pending');
		setError('');
		try {
			await logout();
			router.clearCache();
			await router.navigate({ to: '/' });
			await router.invalidate();
		} catch (failure) {
			setError(errorMessage(failure));
		} finally {
			setStatus('idle');
		}
	}
	return (
		<div className="flex min-h-dvh flex-col">
			<a href="#main" className={s.skip}>
				Przejdź do treści
			</a>
			<header className={s.header}>
				<div className={`${uiStyles.shell} ${s.headerInner}`}>
					<Link to="/" className={s.logo} aria-label="RoomBook — strona główna">
						<span className={s.logoIcon}>
							<CalendarDays size={21} aria-hidden="true" />
						</span>
						roombook<span className="text-accent">.</span>
					</Link>
					<nav className={s.nav} aria-label="Nawigacja główna">
						<Link to="/rooms" className={s.navLink}>
							Sale
						</Link>
						{user ? (
							<>
								<Link to="/bookings" search={{ page: 1 }} className={s.navLink}>
									Moje rezerwacje
								</Link>
								<span className="max-w-36 truncate text-muted">
									{user.name}
								</span>
								<button
									type="button"
									onClick={handleLogout}
									disabled={status === 'pending'}
									className={uiStyles.secondary}
								>
									<LogOut size={16} aria-hidden="true" />
									{status === 'pending' ? 'Wylogowywanie…' : 'Wyloguj'}
								</button>
							</>
						) : (
							<>
								<Link
									to="/login"
									search={{ redirect: '/rooms' }}
									className={s.navLink}
								>
									Zaloguj się
								</Link>
								<Link
									to="/register"
									search={{ redirect: '/rooms' }}
									className={uiStyles.primary}
								>
									Załóż konto
								</Link>
							</>
						)}
					</nav>
				</div>
			</header>
			{error && (
				<p className={`${uiStyles.shell} mt-4 text-error`} role="alert">
					{error}
				</p>
			)}
			<Outlet />
			<footer className={s.footer}>
				<div className={`${uiStyles.shell} ${s.footerInner}`}>
					<span>RoomBook · przestrzeń na dobre spotkania</span>
					<span>Proste rezerwacje. Więcej czasu dla zespołu.</span>
				</div>
			</footer>
		</div>
	);
}
