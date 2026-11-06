import { Link, useRouter } from '@tanstack/react-router';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { ApiError, errorMessage } from '../../shared/api/client';
import { Field } from '../../shared/components/field';
import { uiStyles as s } from '../../shared/components/ui.styles';
import { login, register, safeRedirect } from './api';

type AuthPageProps = { mode: 'login' | 'register'; redirectTo: string };
export function AuthPage({ mode, redirectTo }: AuthPageProps) {
	const router = useRouter();
	const [status, setStatus] = useState<'idle' | 'pending'>('idle');
	const [error, setError] = useState('');
	const [fields, setFields] = useState<Record<string, string[]>>({});
	const isRegistration = mode === 'register';
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (status === 'pending') return;
		const values = new FormData(event.currentTarget);
		const email = String(values.get('email') ?? '');
		const password = String(values.get('password') ?? '');
		setStatus('pending');
		setError('');
		setFields({});
		try {
			if (isRegistration)
				await register({
					email,
					password,
					name: String(values.get('name') ?? ''),
					password_confirmation: String(
						values.get('password_confirmation') ?? '',
					),
				});
			else await login({ email, password });
			router.clearCache();
			await router.invalidate();
			await router.navigate({ href: safeRedirect(redirectTo) });
		} catch (failure) {
			setError(errorMessage(failure));
			if (failure instanceof ApiError) setFields(failure.fields);
		} finally {
			setStatus('idle');
		}
	}
	return (
		<main id="main" className={`${s.shell} ${s.page}`}>
			<div className="mx-auto max-w-lg">
				<p className={s.eyebrow}>
					<LockKeyhole size={16} className="mr-2 inline" aria-hidden="true" />
					Twoja przestrzeń do planowania
				</p>
				<h1 className={s.title}>
					{isRegistration ? 'Zacznijmy od konta.' : 'Dobrze Cię widzieć.'}
				</h1>
				<p className={s.lead}>
					{isRegistration
						? 'Zarejestruj się, aby rezerwować sale dla swojego zespołu.'
						: 'Zaloguj się i wróć do planowania dobrych spotkań.'}
				</p>
				<div className={`${s.panel} mt-8`}>
					{error && (
						<p className={`${s.alert} mb-5`} role="alert">
							{error}
						</p>
					)}
					<form className={s.form} onSubmit={handleSubmit}>
						{isRegistration && (
							<Field
								label="Imię i nazwisko"
								name="name"
								autoComplete="name"
								required
								maxLength={100}
								error={fields.name?.[0]}
							/>
						)}
						<Field
							label="Adres e-mail"
							name="email"
							type="email"
							autoComplete="email"
							required
							maxLength={255}
							error={fields.email?.[0]}
						/>
						<Field
							label="Hasło"
							name="password"
							type="password"
							autoComplete={
								isRegistration ? 'new-password' : 'current-password'
							}
							required
							minLength={isRegistration ? 8 : undefined}
							error={fields.password?.[0]}
						/>
						{isRegistration && (
							<Field
								label="Powtórz hasło"
								name="password_confirmation"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								error={fields.password_confirmation?.[0]}
							/>
						)}
						<button
							className={`${s.primary} w-full`}
							type="submit"
							disabled={status === 'pending'}
						>
							{status === 'pending'
								? 'Chwileczkę…'
								: isRegistration
									? 'Załóż konto'
									: 'Zaloguj się'}
							<ArrowRight size={17} aria-hidden="true" />
						</button>
					</form>
					<p className="mt-6 text-center text-sm text-muted">
						{isRegistration ? 'Masz już konto? ' : 'Nie masz jeszcze konta? '}
						<Link
							to={isRegistration ? '/login' : '/register'}
							search={{ redirect: safeRedirect(redirectTo) }}
							className="text-accent underline underline-offset-4"
						>
							{isRegistration ? 'Zaloguj się' : 'Załóż konto'}
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
