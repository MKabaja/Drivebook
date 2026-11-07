/**
 * Shifts a `YYYY-MM-DD` calendar date by `days` (negative goes back). Works in UTC, so a daylight
 * saving change never skips or repeats a day.
 */
function addDays(date: string, days: number): string {
	const shifted = new Date(`${date}T00:00:00Z`);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted.toISOString().slice(0, 10);
}

export { addDays };
