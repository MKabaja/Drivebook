import { backend } from '@/shared/api/backend';
import { type Pagination, pageOf, resourceOf } from '@/shared/api/envelopes';
import { type Car, carSchema } from '@/features/cars/model/car.schemas';
import type {
	CarSearch,
	RentalDatesSearch,
} from '@/features/cars/model/car-search.schemas';

type CarPage = { cars: Car[]; pagination: Pagination };
type SearchValue = string | number | undefined;

const carPageSchema = pageOf(carSchema);
const carResourceSchema = resourceOf(carSchema);

async function fetchCars(
	search: CarSearch,
	signal: AbortSignal,
): Promise<CarPage> {
	const response = await backend.get(`/api/cars${toQuery(search)}`, {
		signal,
	});
	const { data, meta } = carPageSchema.parse(response);
	return { cars: data, pagination: meta };
}

async function fetchCar(
	carId: number,
	dates: RentalDatesSearch,
	signal: AbortSignal,
): Promise<Car> {
	const response = await backend.get(`/api/cars/${carId}${toQuery(dates)}`, {
		signal,
	});
	return carResourceSchema.parse(response).data;
}

function toQuery(search: Record<string, SearchValue>): string {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(search)) {
		if (value !== undefined) {
			query.set(key, String(value));
		}
	}
	const queryString = query.toString();
	return queryString === '' ? '' : `?${queryString}`;
}

export type { CarPage };
export { fetchCar, fetchCars };
