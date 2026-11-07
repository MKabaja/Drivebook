import { DISPLAY_LOCALE } from '@/shared/config';

const calendarDateFormat = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

/**
 * Formatuje datę kalendarzową `YYYY-MM-DD` do wyświetlenia („10 Nov 2026”) bez przesunięcia przez
 * strefę przeglądarki.
 */
function formatCalendarDate(date: string): string {
	return calendarDateFormat.format(new Date(`${date}T00:00:00Z`));
}

export { formatCalendarDate };
