import { z } from 'zod';

const userSchema = z.object({
	id: z.number().int(),
	name: z.string(),
	email: z.string(),
});

type User = z.infer<typeof userSchema>;
type Credentials = { email: string; password: string };
type Registration = Credentials & {
	name: string;
	password_confirmation: string;
};

export type { Credentials, Registration, User };
export { userSchema };
