import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { HttpError } from '@/shared/api/http-error';
import { RouteError } from '@/shared/components/route-feedback/route-feedback';
import { toWarsawDate } from '@/shared/lib/to-warsaw-date';
import { fetchCar } from '@/features/cars/api/cars.api';
import { CarDetails } from '@/features/cars/components/car-details/car-details';
import { keepValidRentalDates } from '@/features/cars/lib/keep-valid-rental-dates';
import { parseCarId } from '@/features/cars/lib/parse-car-id';
import { carSearchSchema } from '@/features/cars/model/car-search.schemas';

function CarRoute() {
	return (
		<CarDetails
			car={Route.useLoaderData()}
			search={Route.useSearch()}
			today={toWarsawDate(new Date())}
		/>
	);
}

export const Route = createFileRoute('/cars/$carId')({
	validateSearch: (raw) =>
		keepValidRentalDates(carSearchSchema.parse(raw), toWarsawDate(new Date())),
	loaderDeps: ({ search }) => ({
		starts_on: search.starts_on,
		ends_on: search.ends_on,
	}),
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
			if (error instanceof HttpError && error.status === 422) {
				throw redirect({
					to: '/cars/$carId',
					params,
					search: (search) => ({
						...search,
						starts_on: undefined,
						ends_on: undefined,
					}),
				});
			}
			throw error;
		}
	},
	component: CarRoute,
	errorComponent: RouteError,
});
