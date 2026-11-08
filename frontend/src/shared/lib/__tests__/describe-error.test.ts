import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { NetworkError } from '@/shared/api/network-error';
import { describeError } from '@/shared/lib/describe-error';

import { makeHttpError } from '@/test/factories/http-error.factory';

const GENERIC_MESSAGE = 'Something went wrong. Try again in a moment.';

describe('describeError', () => {
	it.each([
		['a 401', makeHttpError(401), 'Sign in to continue.'],
		[
			'a 419',
			makeHttpError(419),
			'Your session has expired. Refresh the page and try again.',
		],
		['a 429', makeHttpError(429), 'Too many attempts. Try again in a minute.'],
		['a 500', makeHttpError(500), GENERIC_MESSAGE],
		[
			'a network error',
			new NetworkError(new TypeError('Failed to fetch')),
			"We couldn't reach the server. Check your connection and try again.",
		],
		[
			'a Zod error',
			z.string().safeParse(1).error,
			'The server sent unexpected data. Try again later.',
		],
		['a plain error', new Error('boom'), GENERIC_MESSAGE],
	])('describes %s', (_label, error, message) => {
		expect(describeError(error)).toBe(message);
	});
});
