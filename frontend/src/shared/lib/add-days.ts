/**
 * Przesuwa datę kalendarzową `YYYY-MM-DD` o `days` dni (ujemne cofają). Liczy w UTC, więc zmiana czasu
 * letniego nie gubi ani nie dubluje dnia.
 */
function addDays(date: string, days: number): string {
	const shifted = new Date(`${date}T00:00:00Z`);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted.toISOString().slice(0, 10);
}

export { addDays };
