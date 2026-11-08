import type { BookingStatus } from '@/features/bookings/model/booking.schemas';

type LabelByBookingStatus = Record<BookingStatus, string>;

const labelByBookingStatus: LabelByBookingStatus = {
	confirmed: 'Confirmed',
	cancelled: 'Cancelled',
};

export { labelByBookingStatus };
