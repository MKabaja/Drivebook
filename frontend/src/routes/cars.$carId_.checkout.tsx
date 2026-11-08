import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { HttpError } from '@/shared/api/http-error';
import { RouteError } from '@/shared/components/route-feedback/route-feedback';
import { toWarsawDate } from '@/shared/lib/to-warsaw-date';
import { InlineAuth } from '@/features/auth/components/inline-auth/inline-auth';
import {
	type AccountSlot,
	Checkout,
} from '@/features/bookings/components/checkout/checkout';
import { fetchCar } from '@/features/cars/api/cars.api';
import { keepValidRentalDates } from '@/features/cars/lib/keep-valid-rental-dates';
import { parseCarId } from '@/features/cars/lib/parse-car-id';
import { rentalDatesSearchSchema } from '@/features/cars/model/car-search.schemas';

function CheckoutRoute() {
	const { car, price } = Route.useLoaderData();

	function renderAccount({ onSignedIn }: AccountSlot) {
		return <InlineAuth onSignedIn={onSignedIn} />;
	}

	return (
		<Checkout
			car={car}
			price={price}
			isAvailable={car.is_available === true}
			today={toWarsawDate(new Date())}
			renderAccount={renderAccount}
		/>
	);
}

export const Route = createFileRoute('/cars/$carId_/checkout')({
	validateSearch: (raw) =>
		keepValidRentalDates(
			rentalDatesSearchSchema.parse(raw),
			toWarsawDate(new Date()),
		),
	loaderDeps: ({ search }) => ({
		starts_on: search.starts_on,
		ends_on: search.ends_on,
	}),
	loader: async ({ params, deps, abortController }) => {
		const carId = parseCarId(params.carId);
		if (carId === undefined) {
			throw notFound();
		}
		const toCarDetails = redirect({
			to: '/cars/$carId',
			params: { carId: params.carId },
		});
		if (deps.starts_on === undefined || deps.ends_on === undefined) {
			throw toCarDetails;
		}
		try {
			const car = await fetchCar(carId, deps, abortController.signal);
			if (car.price === undefined) {
				throw toCarDetails;
			}
			return { car, price: car.price };
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw notFound();
			}
			if (error instanceof HttpError && error.status === 422) {
				throw toCarDetails;
			}
			throw error;
		}
	},
	component: CheckoutRoute,
	errorComponent: RouteError,
});
