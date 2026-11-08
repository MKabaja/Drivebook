import { createFileRoute, redirect } from '@tanstack/react-router';

import { RouteError } from '@/shared/components/route-feedback/route-feedback';
import { toWarsawDate } from '@/shared/lib/to-warsaw-date';
import { fetchCars } from '@/features/cars/api/cars.api';
import { keepValidRentalDates } from '@/features/cars/lib/keep-valid-rental-dates';
import { carSearchSchema } from '@/features/cars/model/car-search.schemas';
import { CatalogPage } from '@/features/cars/pages/catalog-page';

function CarsRoute() {
	return (
		<CatalogPage
			carPage={Route.useLoaderData()}
			search={Route.useSearch()}
			today={toWarsawDate(new Date())}
		/>
	);
}

export const Route = createFileRoute('/cars/')({
	validateSearch: (raw) =>
		keepValidRentalDates(carSearchSchema.parse(raw), toWarsawDate(new Date())),
	loaderDeps: ({ search }) => search,
	loader: async ({ deps, abortController }) => {
		const carPage = await fetchCars(deps, abortController.signal);
		const { current_page, last_page } = carPage.pagination;
		if (current_page > last_page) {
			throw redirect({
				to: '/cars',
				search: { ...deps, page: last_page > 1 ? last_page : undefined },
			});
		}
		return carPage;
	},
	component: CarsRoute,
	errorComponent: RouteError,
});
