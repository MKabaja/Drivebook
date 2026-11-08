import {
	type CarFilterValues,
	type CarSearch,
	carSearchSchema,
} from '@/features/cars/model/car-search.schemas';

/**
 * Converts filter form values into the URL search: empty fields are dropped, seats become a number
 * and the page resets to the first one (no `page`).
 */
function toCarSearch(filters: CarFilterValues): CarSearch {
	return carSearchSchema.parse({
		starts_on: emptyToUndefined(filters.starts_on),
		ends_on: emptyToUndefined(filters.ends_on),
		seats: filters.seats === '' ? undefined : Number(filters.seats),
		transmission: emptyToUndefined(filters.transmission),
	});
}

function emptyToUndefined(value: string): string | undefined {
	return value === '' ? undefined : value;
}

export { toCarSearch };
