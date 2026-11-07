import { Link, Outlet, useRouteContext } from '@tanstack/react-router';
import { CarFront } from 'lucide-react';

import { uiStyles } from '@/shared/components/ui.styles';
import { SignOutButton } from '@/features/auth/components/sign-out-button/sign-out-button';

import { rootLayoutStyles } from './root-layout.styles';

function RootLayout() {
	const { shell, primary } = uiStyles;
	const {
		skip,
		header,
		headerInner,
		logo,
		logoIcon,
		nav,
		navLink,
		footer,
		footerInner,
	} = rootLayoutStyles;
	const user = useRouteContext({
		from: '__root__',
		select: (context) => context.user,
	});

	return (
		<div className="flex min-h-dvh flex-col">
			<a href="#main" className={skip}>
				Skip to content
			</a>
			<header className={header}>
				<div className={`${shell} ${headerInner}`}>
					<Link to="/" className={logo} aria-label="DriveBook — home">
						<span className={logoIcon}>
							<CarFront size={21} aria-hidden="true" />
						</span>
						drivebook<span className="text-accent">.</span>
					</Link>
					<nav className={nav} aria-label="Main navigation">
						<Link to="/cars" className={navLink}>
							Cars
						</Link>
						{user ? (
							<>
								<span className="max-w-36 truncate text-muted">
									{user.name}
								</span>
								<SignOutButton />
							</>
						) : (
							<>
								<Link to="/login" className={navLink}>
									Sign in
								</Link>
								<Link to="/register" className={primary}>
									Create account
								</Link>
							</>
						)}
					</nav>
				</div>
			</header>
			<Outlet />
			<footer className={footer}>
				<div className={`${shell} ${footerInner}`}>
					<span>DriveBook · a car for your journey</span>
					<span>Less paperwork. More road.</span>
				</div>
			</footer>
		</div>
	);
}

export { RootLayout };
