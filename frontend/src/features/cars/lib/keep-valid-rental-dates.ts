import { findRentalDatesError } from '@/features/cars/lib/find-rental-dates-error';
import type { RentalDatesSearch } from '@/features/cars/model/car-search.schemas';

/**
 * Removes both dates from the search when the pair breaks the rental rules (e.g. a saved link with
 * yesterday's pick-up), so the page loads without dates instead of failing with a 422 from the API.
 *
 * @param today - today's date in Warsaw (`YYYY-MM-DD`)
 */
function keepValidRentalDates<Search extends RentalDatesSearch>(
	search: Search,
	today: string,
): Search {
	if (findRentalDatesError(search, today) === undefined) {
		return search;
	}
	return { ...search, starts_on: undefined, ends_on: undefined };
}

export { keepValidRentalDates };
