import { describe, expect, it } from 'vitest';

import { HttpError } from '@/shared/api/http-error';
import { describeError } from '@/shared/lib/describe-error';
import { toAuthFormError } from '@/features/auth/lib/to-auth-form-error';

import {
	makeHttpError,
	makeValidationError,
} from '@/test/factories/http-error.factory';

describe('toAuthFormError', () => {
	it('maps a 422 to the first message of each field', () => {
		const error = makeValidationError({
			email: ['First.', 'Second.'],
			password: ['Too short.'],
		});

		expect(toAuthFormError(error)).toEqual({
			kind: 'fields',
			messageByField: { email: 'First.', password: 'Too short.' },
		});
	});

	it('falls back to a general error for a 422 with empty errors', () => {
		const error = makeValidationError({});

		expect(toAuthFormError(error)).toEqual({
			kind: 'general',
			message: describeError(error),
		});
	});

	it('falls back to a general error for a 422 without a valid body', () => {
		const error = makeHttpError(422);

		expect(toAuthFormError(error)).toEqual({
			kind: 'general',
			message: describeError(error),
		});
	});

	it('does not treat the errors of a non-422 response as field errors', () => {
		const error = new HttpError(409, {
			message: 'Price changed.',
			errors: { email: ['Taken.'] },
		});

		expect(toAuthFormError(error)).toEqual({
			kind: 'general',
			message: describeError(error),
		});
	});
});
