import { ZodError } from 'zod';

import { HttpError } from '@/shared/api/http-error';
import { NetworkError } from '@/shared/api/network-error';

type MessageByStatus = Partial<Record<number, string>>;

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Try again in a moment.';

const messageByStatus: MessageByStatus = {
	401: 'Sign in to continue.',
	419: 'Your session has expired. Refresh the page and try again.',
	429: 'Too many attempts. Try again in a minute.',
};

function describeError(error: unknown): string {
	if (error instanceof NetworkError) {
		return "We couldn't reach the server. Check your connection and try again.";
	}
	if (error instanceof ZodError) {
		return 'The server sent unexpected data. Try again later.';
	}
	if (error instanceof HttpError) {
		return messageByStatus[error.status] ?? GENERIC_ERROR_MESSAGE;
	}
	return GENERIC_ERROR_MESSAGE;
}

export { describeError };
