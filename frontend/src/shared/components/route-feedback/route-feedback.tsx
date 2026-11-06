import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from '@tanstack/react-router';

import { HttpError } from '@/shared/api/http-error';
import { uiStyles } from '@/shared/components/ui.styles';
import { describeError } from '@/shared/lib/describe-error';

const { shell, page, title, lead, primary, secondary } = uiStyles;

function RoutePending() {
	return (
		<div className={`${shell} ${page}`} role="status">
			Loading…
		</div>
	);
}

function RouteError({ error, reset }: ErrorComponentProps) {
	const router = useRouter();
	const isUnauthenticated = error instanceof HttpError && error.status === 401;

	async function handleRetry() {
		await router.invalidate();
		reset();
	}

	return (
		<main id="main" className={`${shell} ${page}`}>
			<h1 className={title}>We couldn't load this page</h1>
			<p className={lead} role="alert">
				{describeError(error)}
			</p>
			<div className="mt-6 flex flex-wrap gap-3">
				{isUnauthenticated ? (
					<Link to="/login" className={primary}>
						Sign in
					</Link>
				) : (
					<button type="button" onClick={handleRetry} className={primary}>
						Try again
					</button>
				)}
				<Link to="/" className={secondary}>
					Home
				</Link>
			</div>
		</main>
	);
}

function NotFoundPage() {
	return (
		<main id="main" className={`${shell} ${page}`}>
			<h1 className={title}>Page not found</h1>
			<Link to="/" className={`${primary} mt-6`}>
				Back to the home page
			</Link>
		</main>
	);
}

export { NotFoundPage, RouteError, RoutePending };
