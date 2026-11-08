import { describe, expect, it } from 'vitest';

import { decideDemoPayment } from '@/features/bookings/lib/decide-demo-payment';

const TODAY = '2026-11-07';

describe('decideDemoPayment', () => {
	it('approves a valid card through the end of its expiry month', () => {
		expect(
			decideDemoPayment(
				{ number: '4242 4242 4242 4242', expiry: '11/26' },
				TODAY,
			),
		).toEqual({ outcome: 'approved' });
	});

	it('declines a card whose expiry month has passed', () => {
		expect(
			decideDemoPayment({ number: '4242424242424242', expiry: '10/26' }, TODAY),
		).toEqual({ outcome: 'declined', message: 'This card has expired.' });
	});

	it('declines the dedicated test card', () => {
		expect(
			decideDemoPayment(
				{ number: '4000 0000 0000 0002', expiry: '12/30' },
				TODAY,
			),
		).toEqual({ outcome: 'declined', message: 'Your card was declined.' });
	});

	it('declines a number that fails the Luhn checksum', () => {
		expect(
			decideDemoPayment(
				{ number: '4242 4242 4242 4241', expiry: '12/30' },
				TODAY,
			),
		).toEqual({ outcome: 'declined', message: 'Check the card number.' });
	});

	it('declines a number that is too short', () => {
		expect(
			decideDemoPayment({ number: '4242', expiry: '12/30' }, TODAY),
		).toEqual({ outcome: 'declined', message: 'Check the card number.' });
	});

	it('declines an expiry date with an impossible month', () => {
		expect(
			decideDemoPayment(
				{ number: '4242 4242 4242 4242', expiry: '13/30' },
				TODAY,
			),
		).toEqual({ outcome: 'declined', message: 'Check the expiry date.' });
	});
});
