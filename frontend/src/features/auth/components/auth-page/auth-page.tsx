import { Link, useRouter } from '@tanstack/react-router';
import { LockKeyhole } from 'lucide-react';

import { uiStyles } from '@/shared/styles/ui.styles';
import { AuthForm } from '@/features/auth/components/auth-form/auth-form';
import {
	type AuthMode,
	copyByAuthMode,
} from '@/features/auth/model/auth.constants';

import { authPageStyles } from './auth-page.styles';

type AuthPageProps = { mode: AuthMode; redirectTo: string };

function AuthPage({ mode, redirectTo }: AuthPageProps) {
	const { shell, page, eyebrow, title, lead, panel } = uiStyles;
	const { container, panelSpacing, switchText, switchLink } = authPageStyles;
	const router = useRouter();
	const copy = copyByAuthMode[mode];

	async function goToRedirect() {
		await router.navigate({ href: redirectTo });
	}

	return (
		<main id="main" tabIndex={-1} className={`${shell} ${page}`}>
			<div className={container}>
				<p className={eyebrow}>
					<LockKeyhole size={16} className="mr-2 inline" aria-hidden="true" />
					Your next trip
				</p>
				<h1 className={title}>{copy.title}</h1>
				<p className={lead}>{copy.lead}</p>
				<div className={`${panel} ${panelSpacing}`}>
					<AuthForm mode={mode} onSignedIn={goToRedirect} />
					<p className={switchText}>
						{copy.switchPrompt}{' '}
						<Link
							to={copy.switchTo}
							search={{ redirect: redirectTo }}
							className={switchLink}
						>
							{copy.switchLabel}
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}

export { AuthPage };
