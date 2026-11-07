import { RENTAL_TIME_ZONE } from '@/shared/config';

const calendarDateFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: RENTAL_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

/**
 * Returns the calendar date (`YYYY-MM-DD`) in Warsaw at the moment `instant`, not in UTC
 * or the browser's time zone.
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
