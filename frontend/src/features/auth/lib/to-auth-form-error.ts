import { z } from 'zod';

import { HttpError } from '@/shared/api/http-error';
import { describeError } from '@/shared/lib/describe-error';

type MessageByField = Partial<Record<string, string>>;
type AuthFormError =
	| { kind: 'fields'; messageByField: MessageByField }
	| { kind: 'general'; message: string };

const validationErrorBodySchema = z.object({
	errors: z.record(z.string(), z.array(z.string()).nonempty()),
});

function toAuthFormError(error: unknown): AuthFormError {
	const messageByField = readMessageByField(error);
	if (messageByField === undefined) {
		return { kind: 'general', message: describeError(error) };
	}
	return { kind: 'fields', messageByField };
}

function readMessageByField(error: unknown): MessageByField | undefined {
	if (!(error instanceof HttpError) || error.status !== 422) {
		return undefined;
	}
	const parsedBody = validationErrorBodySchema.safeParse(error.body);
	if (!parsedBody.success) {
		return undefined;
	}
	const fieldMessages = Object.entries(parsedBody.data.errors);
	if (fieldMessages.length === 0) {
		return undefined;
	}
	return Object.fromEntries(
		fieldMessages.map(([field, messages]) => [field, messages[0]]),
	);
}

export type { AuthFormError, MessageByField };
export { toAuthFormError };
