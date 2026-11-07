import { findRentalDatesError } from '@/features/cars/lib/find-rental-dates-error';
import type { RentalDatesSearch } from '@/features/cars/model/car-search.schemas';

/**
 * Usuwa z wyszukiwania obie daty, gdy para nie spełnia reguł wynajmu (np. zapisany link z wczorajszym
 * odbiorem) — strona ładuje się wtedy bez terminu zamiast kończyć się błędem 422 z API.
 *
 * @param today - dzisiejsza data w Warszawie (`YYYY-MM-DD`)
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
