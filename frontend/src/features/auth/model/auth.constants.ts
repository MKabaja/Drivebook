type AuthMode = 'login' | 'register';
type AuthCopy = {
	title: string;
	lead: string;
	submitLabel: string;
	switchPrompt: string;
	switchLabel: string;
	switchTo: '/login' | '/register';
};
type CopyByAuthMode = Record<AuthMode, AuthCopy>;

const copyByAuthMode: CopyByAuthMode = {
	login: {
		title: 'Good to see you.',
		lead: 'Sign in and get back to planning your trip.',
		submitLabel: 'Sign in',
		switchPrompt: "Don't have an account yet?",
		switchLabel: 'Create account',
		switchTo: '/register',
	},
	register: {
		title: "Let's start with an account.",
		lead: 'Sign up to book the car you have chosen.',
		submitLabel: 'Create account',
		switchPrompt: 'Already have an account?',
		switchLabel: 'Sign in',
		switchTo: '/login',
	},
};

export type { AuthMode };
export { copyByAuthMode };
