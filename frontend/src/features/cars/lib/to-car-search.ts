import {
	type CarFilterValues,
	type CarSearch,
	carSearchSchema,
} from '@/features/cars/model/car-search.schemas';

/**
 * Zamienia wartości formularza filtrów na wyszukiwanie w URL: puste pola znikają, liczba miejsc staje się
 * liczbą, a strona wraca na pierwszą (bez `page`).
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
