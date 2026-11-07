import { uiStyles } from '@/shared/styles/ui.styles';
import type { CarPage } from '@/features/cars/api/cars.api';
import { CarCatalog } from '@/features/cars/components/car-catalog/car-catalog';
import { CarFilters } from '@/features/cars/components/car-filters/car-filters';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

type CatalogPageProps = { carPage: CarPage; search: CarSearch; today: string };

function CatalogPage({ carPage, search, today }: CatalogPageProps) {
	const { shell, page, eyebrow, title, lead } = uiStyles;

	return (
		<main id="main" tabIndex={-1} className={`${shell} ${page}`}>
			<p className={eyebrow}>Our fleet</p>
			<h1 className={title}>Every journey starts here.</h1>
			<p className={lead}>
				Pick a car and a direction. Choose your dates to see which cars are free
				and the full price of the rental.
			</p>
			<CarFilters search={search} today={today} />
			<CarCatalog carPage={carPage} search={search} />
		</main>
	);
}

export { CatalogPage };
