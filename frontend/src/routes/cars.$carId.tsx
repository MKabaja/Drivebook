import { createFileRoute, notFound } from '@tanstack/react-router';

import { HttpError } from '@/shared/api/http-error';
import {
	RouteError,
	RoutePending,
} from '@/shared/components/route-feedback/route-feedback';
import { toWarsawDate } from '@/shared/lib/to-warsaw-date';
import { fetchCar } from '@/features/cars/api/cars.api';
import { CarDetails } from '@/features/cars/components/car-details/car-details';
import { keepValidRentalDates } from '@/features/cars/lib/keep-valid-rental-dates';
import { parseCarId } from '@/features/cars/lib/parse-car-id';
import { rentalDatesSearchSchema } from '@/features/cars/model/car-search.schemas';

function CarRoute() {
	return <CarDetails car={Route.useLoaderData()} dates={Route.useSearch()} />;
}

export const Route = createFileRoute('/cars/$carId')({
	validateSearch: (raw) =>
		keepValidRentalDates(
			rentalDatesSearchSchema.parse(raw),
			toWarsawDate(new Date()),
		),
	loaderDeps: ({ search }) => search,
	loader: async ({ params, deps, abortController }) => {
		const carId = parseCarId(params.carId);
		if (carId === undefined) {
			throw notFound();
		}
		try {
			return await fetchCar(carId, deps, abortController.signal);
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw notFound();
			}
			throw error;
		}
	},
	component: CarRoute,
	pendingComponent: RoutePending,
	errorComponent: RouteError,
});
