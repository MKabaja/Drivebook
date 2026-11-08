import { Link, useRouteContext } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { type ReactNode, useRef } from 'react';

import { uiStyles } from '@/shared/styles/ui.styles';
import { describeCheckoutFailure } from '@/features/bookings/lib/describe-checkout-failure';
import type { Car, RentalPrice } from '@/features/cars/model/car.schemas';

import { CheckoutPaymentForm } from './checkout.payment-form';
import { checkoutStyles } from './checkout.styles';
import { CheckoutSummary } from './checkout.summary';
import { useCheckoutPayment } from './use-checkout-payment';

type AccountSlot = { onSignedIn: () => void };
type RenderAccount = (slot: AccountSlot) => ReactNode;
type CheckoutProps = {
	car: Car;
	price: RentalPrice;
	isAvailable: boolean;
	today: string;
	renderAccount: RenderAccount;
};

function Checkout({
	car,
	price,
	isAvailable,
	today,
	renderAccount,
}: CheckoutProps) {
	const { shell, page, eyebrow, title, panel, alert } = uiStyles;
	const { backLink, layout, steps, step, stepTitle, signedIn, unavailable } =
		checkoutStyles;
	const user = useRouteContext({
		from: '__root__',
		select: (context) => context.user,
	});
	const accountTitleRef = useRef<HTMLHeadingElement>(null);
	const paymentTitleRef = useRef<HTMLHeadingElement>(null);
	const summaryRef = useRef<HTMLElement>(null);
	const { current, pay, clearFailure } = useCheckoutPayment({
		carId: car.id,
		price,
		today,
		focusSummary: () => summaryRef.current?.focus(),
		focusAccount: () => accountTitleRef.current?.focus(),
		focusPayment,
	});
	const failure = current.status === 'failed' ? current.failure : undefined;
	const carParams = { carId: String(car.id) };
	const dates = { starts_on: price.starts_on, ends_on: price.ends_on };

	function focusPayment() {
		paymentTitleRef.current?.focus();
	}

	function handleSignedIn() {
		clearFailure();
		focusPayment();
	}

	return (
		<main id="main" tabIndex={-1} className={`${shell} ${page}`}>
			<Link
				to="/cars/$carId"
				params={carParams}
				search={dates}
				className={backLink}
			>
				<ArrowLeft size={17} aria-hidden="true" />
				Back to the car
			</Link>
			<p className={eyebrow}>Checkout</p>
			<h1 className={title}>Review and pay</h1>
			<div className={layout}>
				<CheckoutSummary ref={summaryRef} car={car} price={price} />
				<div className={steps}>
					<section
						className={`${panel} ${step}`}
						aria-labelledby="checkout-account-title"
					>
						<h2
							id="checkout-account-title"
							ref={accountTitleRef}
							tabIndex={-1}
							className={stepTitle}
						>
							1. Your account
						</h2>
						{user ? (
							<p className={signedIn}>
								Booking as <strong>{user.name}</strong> ({user.email})
							</p>
						) : (
							renderAccount({ onSignedIn: handleSignedIn })
						)}
					</section>
					<section
						className={`${panel} ${step}`}
						aria-labelledby="checkout-payment-title"
					>
						<h2
							id="checkout-payment-title"
							ref={paymentTitleRef}
							tabIndex={-1}
							className={stepTitle}
						>
							2. Payment
						</h2>
						{failure && (
							<p className={alert} role="alert">
								{describeCheckoutFailure(failure, price)}
							</p>
						)}
						{isAvailable ? (
							<CheckoutPaymentForm
								status={current.status}
								totalPriceInGrosze={price.total_price_in_grosze}
								isSignedIn={user !== null}
								onPay={pay}
							/>
						) : (
							<p className={unavailable}>
								This car isn't free on these dates.{' '}
								<Link
									to="/cars/$carId"
									params={carParams}
									search={dates}
									className="text-copy underline underline-offset-4"
								>
									Choose other dates
								</Link>
							</p>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}

export type { AccountSlot };
export { Checkout };
