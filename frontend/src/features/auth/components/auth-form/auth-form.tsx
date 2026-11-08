import { useRouteContext } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Field } from '@/shared/components/field/field';
import { uiStyles } from '@/shared/styles/ui.styles';
import { login, register } from '@/features/auth/api/auth.api';
import {
	type AuthFormError,
	type MessageByField,
	toAuthFormError,
} from '@/features/auth/lib/to-auth-form-error';
import {
	type AuthMode,
	copyByAuthMode,
} from '@/features/auth/model/auth.constants';
import type { User } from '@/features/auth/model/user.schemas';

import { authFormStyles } from './auth-form.styles';

type AuthFormProps = {
	mode: AuthMode;
	onSignedIn: () => Promise<void> | void;
};
type FormState =
	| { status: 'idle' }
	| { status: 'submitting' }
	| { status: 'failed'; error: AuthFormError };
type SubmitAuthForm = (formData: FormData) => Promise<User>;
type SubmitByAuthMode = Record<AuthMode, SubmitAuthForm>;

const NO_FIELD_MESSAGES: MessageByField = {};
const FIELDS_ALERT_MESSAGE = 'Check the highlighted fields.';

const submitByAuthMode: SubmitByAuthMode = {
	login: submitLogin,
	register: submitRegistration,
};

/**
 * Sign-in or registration form. Stores the user in the session before calling `onSignedIn`.
 */
function AuthForm({ mode, onSignedIn }: AuthFormProps) {
	const { alert, form, primary } = uiStyles;
	const { alertSpacing } = authFormStyles;
	const session = useRouteContext({
		from: '__root__',
		select: (context) => context.session,
	});
	const [formState, setFormState] = useState<FormState>({ status: 'idle' });
	const isRegistration = mode === 'register';
	const isSubmitting = formState.status === 'submitting';
	const formError = formState.status === 'failed' ? formState.error : undefined;
	const messageByField =
		formError?.kind === 'fields' ? formError.messageByField : NO_FIELD_MESSAGES;
	const alertMessage =
		formError?.kind === 'general' ? formError.message : FIELDS_ALERT_MESSAGE;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) {
			return;
		}
		const formData = new FormData(event.currentTarget);
		setFormState({ status: 'submitting' });
		try {
			const user = await submitByAuthMode[mode](formData);
			session.setUser(user);
			await onSignedIn();
		} catch (error) {
			setFormState({ status: 'failed', error: toAuthFormError(error) });
		}
	}

	return (
		<>
			{formError && (
				<p className={`${alert} ${alertSpacing}`} role="alert">
					{alertMessage}
				</p>
			)}
			<form className={form} onSubmit={handleSubmit}>
				{isRegistration && (
					<Field
						label="Full name"
						name="name"
						autoComplete="name"
						required
						maxLength={100}
						error={messageByField.name}
					/>
				)}
				<Field
					label="Email address"
					name="email"
					type="email"
					autoComplete="email"
					required
					maxLength={255}
					error={messageByField.email}
				/>
				<Field
					label="Password"
					name="password"
					type="password"
					autoComplete={isRegistration ? 'new-password' : 'current-password'}
					required
					minLength={isRegistration ? 8 : undefined}
					error={messageByField.password}
				/>
				{isRegistration && (
					<Field
						label="Confirm password"
						name="password_confirmation"
						type="password"
						autoComplete="new-password"
						required
						minLength={8}
						error={messageByField.password_confirmation}
					/>
				)}
				<button
					className={`${primary} w-full`}
					type="submit"
					aria-disabled={isSubmitting}
				>
					{isSubmitting ? 'One moment…' : copyByAuthMode[mode].submitLabel}
					<ArrowRight size={17} aria-hidden="true" />
				</button>
			</form>
		</>
	);
}

function submitLogin(formData: FormData): Promise<User> {
	return login({
		email: readField(formData, 'email'),
		password: readField(formData, 'password'),
	});
}

function submitRegistration(formData: FormData): Promise<User> {
	return register({
		name: readField(formData, 'name'),
		email: readField(formData, 'email'),
		password: readField(formData, 'password'),
		password_confirmation: readField(formData, 'password_confirmation'),
	});
}

function readField(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === 'string' ? value : '';
}

export { AuthForm };
