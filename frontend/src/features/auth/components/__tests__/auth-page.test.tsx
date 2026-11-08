import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { makeUser } from '@/test/factories/user.factory';
import { page, resource } from '@/test/msw/envelopes';
import { signedInAs } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createDeferred } from '@/test/utils/deferred';
import { renderApp } from '@/test/utils/render-app';

const EMAIL = 'demo@drivebook.test';
const PASSWORD = 'demo-password-123';

describe('login', () => {
	it('shows field errors, keeps focus on the submit button and marks the field invalid on 422', async () => {
		const message = 'These credentials do not match our records.';
		server.use(
			http.post('/api/login', () =>
				HttpResponse.json(
					{ message, errors: { email: [message] } },
					{ status: 422 },
				),
			),
		);
		const { user } = renderApp('/login');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Check the highlighted fields.',
		);
		const email = screen.getByLabelText('Email address');
		expect(email).toHaveAttribute('aria-invalid', 'true');
		expect(email).toHaveAccessibleDescription(message);
		expect(screen.getByRole('button', { name: 'Sign in' })).toHaveFocus();
	});

	it('shows the user in the header and goes to the car catalog after signing in', async () => {
		const driver = makeUser({ name: 'Anna Driver' });
		server.use(
			http.post('/api/login', () => HttpResponse.json(resource(driver))),
			emptyCatalog(),
		);
		const { router, user } = renderApp('/login');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		expect(await screen.findByText('Anna Driver')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Sign out' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/cars');
	});

	it('goes to the requested page after signing in', async () => {
		server.use(
			http.post('/api/login', () => HttpResponse.json(resource(makeUser()))),
		);
		const { router, user } = renderApp('/login?redirect=%2F%3Fref%3Dheader');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		await screen.findByRole('button', { name: 'Sign out' });
		expect(router.state.location.href).toBe('/?ref=header');
	});

	it('shows the rate limit message on 429', async () => {
		server.use(
			http.post('/api/login', () =>
				HttpResponse.json({ message: 'Too Many Attempts.' }, { status: 429 }),
			),
		);
		const { user } = renderApp('/login');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Too many attempts. Try again in a minute.',
		);
	});

	it('disables the button while signing in and sends the request only once', async () => {
		const response = createDeferred();
		let loginRequests = 0;
		server.use(
			http.post('/api/login', async () => {
				loginRequests += 1;
				await response.promise;
				return HttpResponse.json(resource(makeUser()));
			}),
			emptyCatalog(),
		);
		const { user } = renderApp('/login');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));
		const button = await screen.findByRole('button', { name: /One moment/ });
		await user.click(button);

		expect(button).toHaveAttribute('aria-disabled', 'true');
		expect(button).toHaveTextContent('One moment…');
		expect(loginRequests).toBe(1);

		response.resolve();
		await screen.findByRole('button', { name: 'Sign out' });
	});

	it('fetches the CSRF cookie before sending the credentials', async () => {
		const calls: string[] = [];
		server.use(
			http.get('/sanctum/csrf-cookie', () => {
				calls.push('csrf');
				return new HttpResponse(null, { status: 204 });
			}),
			http.post('/api/login', () => {
				calls.push('login');
				return HttpResponse.json(resource(makeUser()));
			}),
			emptyCatalog(),
		);
		const { user } = renderApp('/login');

		await fillCredentials(user);
		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		await screen.findByRole('button', { name: 'Sign out' });
		expect(calls).toEqual(['csrf', 'login']);
	});

	async function fillCredentials(
		user: ReturnType<typeof renderApp>['user'],
	): Promise<void> {
		await user.type(await screen.findByLabelText('Email address'), EMAIL);
		await user.type(screen.getByLabelText('Password'), PASSWORD);
	}
});

describe('login page for a signed-in user', () => {
	it('goes straight to the requested page', async () => {
		server.use(
			signedInAs(makeUser()),
			http.get('/api/bookings', () => HttpResponse.json(page([]))),
		);
		const { router } = renderApp('/login?redirect=%2Fbookings');

		expect(
			await screen.findByRole('heading', { name: 'You have no bookings yet.' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/bookings');
	});
});

describe('registration', () => {
	it('describes the email field with the server message on 422', async () => {
		const message = 'The email has already been taken.';
		server.use(
			http.post('/api/register', () =>
				HttpResponse.json(
					{ message, errors: { email: [message] } },
					{ status: 422 },
				),
			),
		);
		const { user } = renderApp('/register');

		await user.type(await screen.findByLabelText('Full name'), 'Demo Driver');
		await user.type(screen.getByLabelText('Email address'), EMAIL);
		await user.type(screen.getByLabelText('Password'), PASSWORD);
		await user.type(screen.getByLabelText('Confirm password'), PASSWORD);
		await user.click(screen.getByRole('button', { name: 'Create account' }));

		await screen.findByRole('alert');
		expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
			message,
		);
	});

	it('fetches the CSRF cookie and sends the registration form, then shows the user', async () => {
		const calls: string[] = [];
		let body: unknown;
		server.use(
			http.get('/sanctum/csrf-cookie', () => {
				calls.push('csrf');
				return new HttpResponse(null, { status: 204 });
			}),
			http.post('/api/register', async ({ request }) => {
				calls.push('register');
				body = await request.json();
				return HttpResponse.json(resource(makeUser({ name: 'Demo Driver' })), {
					status: 201,
				});
			}),
			emptyCatalog(),
		);
		const { user } = renderApp('/register');

		await user.type(await screen.findByLabelText('Full name'), 'Demo Driver');
		await user.type(screen.getByLabelText('Email address'), EMAIL);
		await user.type(screen.getByLabelText('Password'), PASSWORD);
		await user.type(screen.getByLabelText('Confirm password'), PASSWORD);
		await user.click(screen.getByRole('button', { name: 'Create account' }));

		expect(await screen.findByText('Demo Driver')).toBeInTheDocument();
		expect(calls).toEqual(['csrf', 'register']);
		expect(body).toEqual({
			name: 'Demo Driver',
			email: EMAIL,
			password: PASSWORD,
			password_confirmation: PASSWORD,
		});
	});
});

describe('sign out', () => {
	it('shows the guest header and does not ask the API for the user again', async () => {
		server.use(signedInAs(makeUser({ name: 'Anna Driver' })));
		server.use(
			http.post('/api/logout', () => new HttpResponse(null, { status: 204 })),
		);
		const { user } = renderApp('/');
		await screen.findByText('Anna Driver');
		let userRequestsAfterLogout = 0;
		server.use(
			http.get('/api/user', () => {
				userRequestsAfterLogout += 1;
				return HttpResponse.json(resource(makeUser()));
			}),
		);

		await user.click(screen.getByRole('button', { name: 'Sign out' }));

		expect(
			await screen.findByRole('link', { name: 'Sign in' }),
		).toBeInTheDocument();
		expect(screen.queryByText('Anna Driver')).not.toBeInTheDocument();
		expect(userRequestsAfterLogout).toBe(0);
	});

	it('shows the guest header when the session has already ended (401)', async () => {
		server.use(signedInAs(makeUser({ name: 'Anna Driver' })));
		server.use(
			http.post('/api/logout', () =>
				HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
			),
		);
		const { user } = renderApp('/');
		await screen.findByText('Anna Driver');

		await user.click(screen.getByRole('button', { name: 'Sign out' }));

		expect(
			await screen.findByRole('link', { name: 'Sign in' }),
		).toBeInTheDocument();
		expect(screen.queryByText('Anna Driver')).not.toBeInTheDocument();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});
});

function emptyCatalog() {
	return http.get('/api/cars', () => HttpResponse.json(page([])));
}
