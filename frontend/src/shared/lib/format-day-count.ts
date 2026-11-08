import { DISPLAY_LOCALE } from '@/shared/config';

const dayCountRules = new Intl.PluralRules(DISPLAY_LOCALE);

function formatDayCount(days: number): string {
	return dayCountRules.select(days) === 'one' ? `${days} day` : `${days} days`;
}

export { formatDayCount };
