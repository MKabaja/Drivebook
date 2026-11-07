const FALLBACK_PATH = '/cars';
const ALLOWED_PATHNAMES = new Set(['/', '/cars', '/bookings']);
const CAR_DETAILS_PATHNAME = /^\/cars\/[1-9]\d*$/;
const UNSAFE_CHARACTERS = /[\\\r\n]/;
const PARSING_ORIGIN = 'https://drivebook.local';

function safeRedirect(value: unknown): string {
	if (!isLocalPath(value)) {
		return FALLBACK_PATH;
	}
	const target = new URL(value, PARSING_ORIGIN);
	if (!isAllowedPathname(target.pathname)) {
		return FALLBACK_PATH;
	}
	return `${target.pathname}${target.search}`;
}

function isLocalPath(value: unknown): value is string {
	return (
		typeof value === 'string' &&
		value.startsWith('/') &&
		!value.startsWith('//') &&
		!UNSAFE_CHARACTERS.test(value)
	);
}

function isAllowedPathname(pathname: string): boolean {
	return ALLOWED_PATHNAMES.has(pathname) || CAR_DETAILS_PATHNAME.test(pathname);
}

export { safeRedirect };
