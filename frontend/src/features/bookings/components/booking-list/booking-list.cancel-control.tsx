import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { uiStyles } from '@/shared/components/ui.styles';
import type { Booking } from '@/features/bookings/model/booking.schemas';

import { bookingListStyles } from './booking-list.styles';

type BookingListCancelControlProps = {
	booking: Booking;
	isCancelling: boolean;
	isLocked: boolean;
	onCancel: (booking: Booking) => void;
};

function BookingListCancelControl({
	booking,
	isCancelling,
	isLocked,
	onCancel,
}: BookingListCancelControlProps) {
	const { secondary } = uiStyles;
	const { confirm, confirmQuestion } = bookingListStyles;
	const [isConfirming, setIsConfirming] = useState(false);
	const cancelButtonRef = useRef<HTMLButtonElement>(null);
	const confirmButtonRef = useRef<HTMLButtonElement>(null);
	const carName = booking.car.name;

	function askToConfirm() {
		flushSync(() => setIsConfirming(true));
		confirmButtonRef.current?.focus();
	}

	function keepBooking() {
		flushSync(() => setIsConfirming(false));
		cancelButtonRef.current?.focus();
	}

	if (!isConfirming) {
		return (
			<button
				ref={cancelButtonRef}
				type="button"
				onClick={askToConfirm}
				disabled={isLocked}
				className={secondary}
			>
				Cancel booking <span className="sr-only">for {carName}</span>
			</button>
		);
	}

	return (
		<fieldset className={confirm}>
			<legend className={confirmQuestion}>Cancel the {carName} booking?</legend>
			<button
				ref={confirmButtonRef}
				type="button"
				onClick={() => onCancel(booking)}
				aria-disabled={isLocked}
				className={secondary}
			>
				{isCancelling ? 'Cancelling…' : 'Yes, cancel'}
			</button>
			<button
				type="button"
				onClick={keepBooking}
				disabled={isLocked}
				className={secondary}
			>
				Keep booking
			</button>
		</fieldset>
	);
}

export { BookingListCancelControl };
