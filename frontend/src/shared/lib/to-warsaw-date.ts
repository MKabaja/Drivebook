import { RENTAL_TIME_ZONE } from '@/shared/config';

const calendarDateFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: RENTAL_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

/**
 * Zwraca datę kalendarzową (`YYYY-MM-DD`), jaka w chwili `instant` obowiązuje w Warszawie — nie w UTC
 * ani w strefie przeglądarki.
 */
function toWarsawDate(instant: Date): string {
	const parts = calendarDateFormat.formatToParts(instant);
	return `${readPart(parts, 'year')}-${readPart(parts, 'month')}-${readPart(parts, 'day')}`;
}

function readPart(
	parts: Intl.DateTimeFormatPart[],
	type: Intl.DateTimeFormatPartTypes,
): string {
	return parts.find((part) => part.type === type)?.value ?? '';
}

export { toWarsawDate };
