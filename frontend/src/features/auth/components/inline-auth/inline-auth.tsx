import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { AuthForm } from '@/features/auth/components/auth-form/auth-form';
import type { AuthMode } from '@/features/auth/model/auth.constants';

import { inlineAuthStyles } from './inline-auth.styles';

type InlineAuthProps = { onSignedIn: () => void };
type ModeOption = { mode: AuthMode; label: string };

const MODE_OPTIONS: ModeOption[] = [
	{ mode: 'login', label: 'Sign in' },
	{ mode: 'register', label: 'Create account' },
];

/**
 * Sign-in and registration in place, without leaving the current page. After success the router
 * reloads so every route sees the user, then `onSignedIn` runs (e.g. to move focus).
 */
function InlineAuth({ onSignedIn }: InlineAuthProps) {
	const { switcher, option, activeOption } = inlineAuthStyles;
	const router = useRouter();
	const [mode, setMode] = useState<AuthMode>('login');

	async function handleSignedIn() {
		onSignedIn();
		await router.invalidate();
	}

	return (
		<div>
			<fieldset className={switcher}>
				<legend className="sr-only">Account</legend>
				{MODE_OPTIONS.map(({ mode: optionMode, label }) => (
					<button
						key={optionMode}
						type="button"
						aria-pressed={mode === optionMode}
						onClick={() => setMode(optionMode)}
						className={mode === optionMode ? activeOption : option}
					>
						{label}
					</button>
				))}
			</fieldset>
			<AuthForm key={mode} mode={mode} onSignedIn={handleSignedIn} />
		</div>
	);
}

export { InlineAuth };
