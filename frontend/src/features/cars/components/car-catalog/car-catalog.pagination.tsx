import { Link } from '@tanstack/react-router';

import type { Pagination } from '@/shared/api/envelopes';
import { uiStyles } from '@/shared/styles/ui.styles';
import type { CarSearch } from '@/features/cars/model/car-search.schemas';

import { carCatalogStyles } from './car-catalog.styles';

type CarCatalogPaginationProps = {
	pagination: Pagination;
	search: CarSearch;
	onNavigate: () => void;
};

function CarCatalogPagination({
	pagination,
	search,
	onNavigate,
}: CarCatalogPaginationProps) {
	const { secondary } = uiStyles;
	const { pager, pagerLabel } = carCatalogStyles;
	const { current_page, last_page } = pagination;

	if (last_page <= 1) {
		return null;
	}

	return (
		<nav className={pager} aria-label="Car pages">
			{current_page > 1 && (
				<Link
					to="/cars"
					search={{ ...search, page: current_page - 1 }}
					resetScroll={false}
					onClick={onNavigate}
					className={secondary}
				>
					Previous
				</Link>
			)}
			<span className={pagerLabel}>
				Page {current_page} of {last_page}
			</span>
			{current_page < last_page && (
				<Link
					to="/cars"
					search={{ ...search, page: current_page + 1 }}
					resetScroll={false}
					onClick={onNavigate}
					className={secondary}
				>
					Next
				</Link>
			)}
		</nav>
	);
}

export { CarCatalogPagination };
