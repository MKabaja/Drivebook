import { ZodError, z } from 'zod';

import { HttpError } from '@/shared/api/http-error';
import { NetworkError } from '@/shared/api/network-error';
import { describeError } from '@/shared/lib/describe-error';

type BookingFailure =
	| { kind: 'price-changed' }
	| { kind: 'signed-out' }
	| { kind: 'rejected'; message: string }
	| { kind: 'unconfirmed' }
	| { kind: 'general'; message: string };

const SIGNED_OUT_STATUSES = new Set([401, 419]);

const validationErrorBodySchema = z.object({
	errors: z.record(z.string(), z.array(z.string()).nonempty()),
});

/**
 * Maps a failed booking request to what the UI does next: 409 – the daily rate changed, 401/419 – the
 * session is gone, 422 – the first rule the backend rejected, a network error or an unexpected
 * response body – the outcome is unknown, so the user checks it instead of retrying.
 */
function toBookingFailure(error: unknown): BookingFailure {
	if (error instanceof NetworkError || error instanceof ZodError) {
		return { kind: 'unconfirmed' };
	}
	if (!(error instanceof HttpError)) {
		return { kind: 'general', message: describeError(error) };
	}
	if (error.status === 409) {
		return { kind: 'price-changed' };
	}
	if (SIGNED_OUT_STATUSES.has(error.status)) {
		return { kind: 'signed-out' };
	}
	const validationMessage = readFirstValidationMessage(error.body);
	if (error.status === 422 && validationMessage !== undefined) {
		return { kind: 'rejected', message: validationMessage };
	}
	return { kind: 'general', message: describeError(error) };
}

function readFirstValidationMessage(body: unknown): string | undefined {
	const parsedBody = validationErrorBodySchema.safeParse(body);
	if (!parsedBody.success) {
		return undefined;
	}
	return Object.values(parsedBody.data.errors)[0]?.[0];
}

export type { BookingFailure };
export { toBookingFailure };
