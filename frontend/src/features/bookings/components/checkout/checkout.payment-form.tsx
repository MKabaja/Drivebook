import { CreditCard } from 'lucide-react';
import type { FormEvent } from 'react';

import { Field } from '@/shared/components/field/field';
import { formatPrice } from '@/shared/lib/format-price';
import { uiStyles } from '@/shared/styles/ui.styles';
import type { DemoCard } from '@/features/bookings/lib/decide-demo-payment';
import { demoCardNumberByOutcome } from '@/features/bookings/model/payment.constants';

import { checkoutStyles } from './checkout.styles';
import type { CheckoutStatus } from './use-checkout-payment';

type PaymentStatus = CheckoutStatus['status'];
type CheckoutPaymentFormProps = {
	status: PaymentStatus;
	totalPriceInGrosze: number;
	isSignedIn: boolean;
	onPay: (card: DemoCard) => void;
};
type BusyLabelByStatus = Record<
	Exclude<PaymentStatus, 'idle' | 'failed'>,
	string
>;

const busyLabelByStatus: BusyLabelByStatus = {
	paying: 'Processing payment…',
	booking: 'Booking…',
	'refreshing-price': 'Booking…',
};

function CheckoutPaymentForm({
	status,
	totalPriceInGrosze,
	isSignedIn,
	onPay,
}: CheckoutPaymentFormProps) {
	const { form, primary } = uiStyles;
	const { demoNotice, cardFields, payHint } = checkoutStyles;
	const isBusy = status !== 'idle' && status !== 'failed';

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		onPay({
			number: readField(formData, 'card_number'),
			expiry: readField(formData, 'card_expiry'),
		});
	}

	return (
		<form className={form} onSubmit={handleSubmit}>
			<p className={demoNotice}>
				Demo checkout — no real payment is taken, so never enter a real card.
				Use the test card {demoCardNumberByOutcome.approved} with any future
				date and CVC, or {demoCardNumberByOutcome.declined} to see a decline.
			</p>
			<fieldset disabled={!isSignedIn} className={form}>
				<legend className="sr-only">Card details</legend>
				<Field
					label="Card number"
					name="card_number"
					inputMode="numeric"
					autoComplete="off"
					required
					pattern="[0-9 ]{13,23}"
					maxLength={23}
				/>
				<div className={cardFields}>
					<Field
						label="Expiry date (MM/YY)"
						name="card_expiry"
						autoComplete="off"
						required
						pattern="(0[1-9]|1[0-2])/[0-9]{2}"
						maxLength={5}
						placeholder="MM/YY"
					/>
					<Field
						label="CVC"
						name="card_cvc"
						inputMode="numeric"
						autoComplete="off"
						required
						pattern="[0-9]{3,4}"
						maxLength={4}
					/>
				</div>
				<button
					type="submit"
					aria-disabled={isBusy}
					className={`${primary} w-full`}
				>
					<CreditCard size={18} aria-hidden="true" />
					{toPayLabel(status, totalPriceInGrosze)}
				</button>
			</fieldset>
			<p className={payHint}>
				{isSignedIn
					? 'You can cancel for free until pick-up time.'
					: 'Sign in or create an account above to pay.'}
			</p>
		</form>
	);
}

function toPayLabel(status: PaymentStatus, totalPriceInGrosze: number): string {
	if (status === 'idle' || status === 'failed') {
		return `Pay ${formatPrice(totalPriceInGrosze)} and book`;
	}
	return busyLabelByStatus[status];
}

function readField(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === 'string' ? value : '';
}

export { CheckoutPaymentForm };
