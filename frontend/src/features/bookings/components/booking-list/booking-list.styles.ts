import type { BookingStatus } from '@/features/bookings/model/booking.schemas';

type BadgeByBookingStatus = Record<BookingStatus, string>;

const bookingListStyles = {
	outcome: 'mt-8',
	list: 'mt-8 grid gap-5',
	card: 'grid gap-5 overflow-hidden rounded-2xl border border-line bg-panel p-5 sm:grid-cols-[200px_1fr] sm:p-6',
	image: 'aspect-[1.6] w-full rounded-xl object-cover',
	header: 'flex flex-wrap items-start justify-between gap-4',
	titleRow: 'flex flex-wrap items-center gap-3',
	carName: 'text-xl font-semibold tracking-tight',
	badgeBase: 'rounded-full px-3 py-1 text-xs font-medium',
	dates: 'mt-3 text-sm text-muted',
	total: 'text-right text-xl font-semibold',
	breakdown: 'mt-1 block text-xs font-normal text-muted',
	footer:
		'mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4',
	policy: 'text-sm text-muted',
	confirm: 'm-0 flex flex-wrap items-center gap-3 border-0 p-0',
	confirmQuestion: 'float-left mr-1 text-sm font-medium',
	pager: 'mt-8 flex flex-wrap items-center justify-center gap-4',
	pagerLabel: 'text-sm text-muted',
	emptyTitle: 'text-xl text-copy',
	emptyText: 'mt-3',
	emptyAction: 'mt-5',
} satisfies Record<string, string>;

const badgeByBookingStatus: BadgeByBookingStatus = {
	confirmed: 'bg-accent text-canvas',
	cancelled: 'border border-control text-muted',
};

export { badgeByBookingStatus, bookingListStyles };
