import type {
	CarFilterValues,
	CarSearch,
} from '@/features/cars/model/car-search.schemas';

function toCarFilters(search: CarSearch): CarFilterValues {
	return {
		starts_on: search.starts_on ?? '',
		ends_on: search.ends_on ?? '',
		seats: search.seats === undefined ? '' : String(search.seats),
		transmission: search.transmission ?? '',
	};
}

export { toCarFilters };
