import { BOOKING_HORIZON_DAYS, MAX_RENTAL_DAYS } from '@/shared/config';
import { addDays } from '@/shared/lib/add-days';
import type { RentalDatesSearch } from '@/features/cars/model/car-search.schemas';

type RentalDateField = keyof RentalDatesSearch;
type RentalDatesError = { field: RentalDateField; message: string };

/**
 * Checks a rental date pair against the backend rules: both or neither, pick-up from tomorrow up to the
 * booking horizon, return after pick-up and within the rental day limit.
 *
 * @param today - today's date in Warsaw (`YYYY-MM-DD`)
 * @returns the first violated rule, or `undefined` when the pair is valid or empty
 */
function findRentalDatesError(
	{ starts_on, ends_on }: RentalDatesSearch,
	today: string,
): RentalDatesError | undefined {
	if (starts_on === undefined && ends_on === undefined) {
		return undefined;
	}
	if (starts_on === undefined) {
		return { field: 'starts_on', message: 'Choose a pick-up date.' };
	}
	if (ends_on === undefined) {
		return { field: 'ends_on', message: 'Choose a return date.' };
	}
	if (starts_on <= today) {
		return {
			field: 'starts_on',
			message: 'Pick-up is available from tomorrow.',
		};
	}
	if (starts_on > addDays(today, BOOKING_HORIZON_DAYS)) {
		return {
			field: 'starts_on',
			message: `Pick-up must be within ${BOOKING_HORIZON_DAYS} days from today.`,
		};
	}
	if (ends_on <= starts_on) {
		return { field: 'ends_on', message: 'Return must be after pick-up.' };
	}
	if (ends_on > addDays(starts_on, MAX_RENTAL_DAYS)) {
		return {
			field: 'ends_on',
			message: `A rental can last up to ${MAX_RENTAL_DAYS} days.`,
		};
	}
	return undefined;
}

export type { RentalDateField, RentalDatesError };
export { findRentalDatesError };
