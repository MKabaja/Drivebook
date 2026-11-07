import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { makeCar } from '@/test/factories/car.factory';
import { page } from '@/test/msw/envelopes';
import { server } from '@/test/msw/server';
import { renderApp } from '@/test/utils/render-app';

describe('root layout', () => {
	it('moves focus to the main content after navigating to another page', async () => {
		server.use(
			http.get('/api/cars', () => HttpResponse.json(page([makeCar()]))),
		);
		const { user } = renderApp('/');
		const navigation = await screen.findByRole('navigation', {
			name: 'Main navigation',
		});

		expect(screen.getByRole('main')).not.toHaveFocus();

		await user.click(within(navigation).getByRole('link', { name: 'Cars' }));

		await screen.findByRole('heading', { name: 'Ford Mustang' });
		expect(screen.getByRole('main')).toHaveFocus();
	});
});
