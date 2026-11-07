import { z } from 'zod';

const calendarDateSchema = z.iso.date();

function isCalendarDate(value: string): boolean {
	return calendarDateSchema.safeParse(value).success;
}

export { isCalendarDate };
