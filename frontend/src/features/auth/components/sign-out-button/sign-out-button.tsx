import { useRouteContext, useRouter } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

import { describeError } from '@/shared/lib/describe-error';
import { uiStyles } from '@/shared/styles/ui.styles';
import { logout } from '@/features/auth/api/auth.api';

type SignOutState =
	| { status: 'idle' }
	| { status: 'signing-out' }
	| { status: 'failed'; message: string };

function SignOutButton() {
	const { secondary } = uiStyles;
	const router = useRouter();
	const session = useRouteContext({
		from: '__root__',
		select: (context) => context.session,
	});
	const [signOutState, setSignOutState] = useState<SignOutState>({
		status: 'idle',
	});
	const isSigningOut = signOutState.status === 'signing-out';

	async function handleSignOut() {
		setSignOutState({ status: 'signing-out' });
		try {
			await logout();
			session.setUser(null);
			await router.navigate({ to: '/' });
			await router.invalidate();
			document.getElementById('main')?.focus();
		} catch (error) {
			setSignOutState({ status: 'failed', message: describeError(error) });
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={handleSignOut}
				disabled={isSigningOut}
				className={secondary}
			>
				<LogOut size={16} aria-hidden="true" />
				{isSigningOut ? 'Signing out…' : 'Sign out'}
			</button>
			{signOutState.status === 'failed' && (
				<p className="w-full text-error" role="alert">
					{signOutState.message}
				</p>
			)}
		</>
	);
}

export { SignOutButton };
