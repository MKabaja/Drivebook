import { Link } from '@tanstack/react-router';
import { useRef } from 'react';

import { uiStyles } from '@/shared/styles/ui.styles';
import type { CarPage } from '@/features/cars/api/cars.api';
import { CarCard } from '@/features/cars/components/car-card/car-card';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

import { CarCatalogPagination } from './car-catalog.pagination';
import { carCatalogStyles } from './car-catalog.styles';

type CarCatalogProps = { carPage: CarPage; search: CarSearch };

function CarCatalog({ carPage, search }: CarCatalogProps) {
	const { grid, empty, secondary } = uiStyles;
	const { count, emptyTitle, emptyText, emptyAction } = carCatalogStyles;
	const { cars, pagination } = carPage;
	const headingRef = useRef<HTMLHeadingElement>(null);

	function focusResults() {
		headingRef.current?.focus();
	}

	return (
		<section aria-labelledby="car-catalog-title">
			<h2
				id="car-catalog-title"
				ref={headingRef}
				tabIndex={-1}
				className="sr-only"
			>
				Cars
			</h2>
			<p className={count} role="status">
				{pagination.total === 1
					? '1 car found'
					: `${pagination.total} cars found`}
			</p>
			{cars.length > 0 ? (
				<ul className={grid}>
					{cars.map((car) => (
						<li key={car.id} className="flex">
							<CarCard car={car} search={search} />
						</li>
					))}
				</ul>
			) : (
				<div className={empty}>
					<h3 className={emptyTitle}>No car matches your filters.</h3>
					<p className={emptyText}>
						Try other dates or fewer filters to see more cars.
					</p>
					<Link to="/cars" className={`${secondary} ${emptyAction}`}>
						Clear filters
					</Link>
				</div>
			)}
			<CarCatalogPagination
				pagination={pagination}
				search={search}
				onNavigate={focusResults}
			/>
		</section>
	);
}

export { CarCatalog };
