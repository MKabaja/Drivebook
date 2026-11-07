import { DISPLAY_LOCALE } from '@/shared/config';

const calendarDateFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

/**
 * Formats a `YYYY-MM-DD` calendar date for display (`10 Nov 2026`) without shifting it by the
 * browser's time zone.
 */
function formatCalendarDate(date: string): string {
	return calendarDateFormat.format(new Date(`${date}T00:00:00Z`));
}

export { formatCalendarDate };
