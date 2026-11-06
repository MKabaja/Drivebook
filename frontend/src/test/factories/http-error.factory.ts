import { HttpError } from '@/shared/api/http-error';

function makeValidationError(
	messagesByField: Record<string, string[]>,
): HttpError {
	return new HttpError(422, {
		message: 'The given data was invalid.',
		errors: messagesByField,
	});
}

function makeHttpError(status: number): HttpError {
	return new HttpError(status, undefined);
}

export { makeHttpError, makeValidationError };
