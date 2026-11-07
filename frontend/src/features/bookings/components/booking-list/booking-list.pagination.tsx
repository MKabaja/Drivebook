import { Link } from '@tanstack/react-router';

import type { Pagination } from '@/shared/api/envelopes';
import { uiStyles } from '@/shared/components/ui.styles';

import { bookingListStyles } from './booking-list.styles';

type BookingListPaginationProps = {
	pagination: Pagination;
	onNavigate: () => void;
};

function BookingListPagination({
	pagination,
	onNavigate,
}: BookingListPaginationProps) {
	const { secondary } = uiStyles;
	const { pager, pagerLabel } = bookingListStyles;
	const { current_page, last_page } = pagination;

	if (last_page <= 1) {
		return null;
	}

	return (
		<nav className={pager} aria-label="Booking pages">
			{current_page > 1 && (
				<Link
					to="/bookings"
					search={{ page: current_page > 2 ? current_page - 1 : undefined }}
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
					to="/bookings"
					search={{ page: current_page + 1 }}
					onClick={onNavigate}
					className={secondary}
				>
					Next
				</Link>
			)}
		</nav>
	);
}

export { BookingListPagination };
