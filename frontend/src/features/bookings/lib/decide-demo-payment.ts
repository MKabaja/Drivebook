import {
	type DemoPaymentOutcome,
	demoCardNumberByOutcome,
} from '@/features/bookings/model/payment.constants';

type DemoCard = { number: string; expiry: string };
type DemoPaymentResult =
	| { outcome: Extract<DemoPaymentOutcome, 'approved'> }
	| { outcome: Extract<DemoPaymentOutcome, 'declined'>; message: string };

const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/(\d{2})$/;
const CARD_NUMBER_PATTERN = /^\d{13,19}$/;

/**
 * Decides the demo payment without any network call: the declined test card and an expired card
 * are refused, any other number must pass the Luhn checksum. A card expires after its `MM/YY` month.
 *
 * @param today - today's date in Warsaw (`YYYY-MM-DD`)
 */
function decideDemoPayment(card: DemoCard, today: string): DemoPaymentResult {
	const digits = toDigits(card.number);
	if (digits === toDigits(demoCardNumberByOutcome.declined)) {
		return decline('Your card was declined.');
	}
	if (!CARD_NUMBER_PATTERN.test(digits) || !passesLuhn(digits)) {
		return decline('Check the card number.');
	}
	const expiryMonthIndex = toExpiryMonthIndex(card.expiry);
	if (expiryMonthIndex === undefined) {
		return decline('Check the expiry date.');
	}
	if (expiryMonthIndex < toMonthIndex(today)) {
		return decline('This card has expired.');
	}
	return { outcome: 'approved' };
}

function decline(message: string): DemoPaymentResult {
	return { outcome: 'declined', message };
}

function toDigits(cardNumber: string): string {
	return cardNumber.replaceAll(' ', '');
}

function passesLuhn(digits: string): boolean {
	let sum = 0;
	for (const [index, character] of [...digits].reverse().entries()) {
		const digit = Number(character);
		const doubled = index % 2 === 1 ? digit * 2 : digit;
		sum += doubled > 9 ? doubled - 9 : doubled;
	}
	return sum % 10 === 0;
}

function toExpiryMonthIndex(expiry: string): number | undefined {
	const match = EXPIRY_PATTERN.exec(expiry);
	if (match === null) {
		return undefined;
	}
	return (2000 + Number(match[2])) * 12 + Number(match[1]);
}

function toMonthIndex(date: string): number {
	const [year = 0, month = 0] = date.split('-').map(Number);
	return year * 12 + month;
}

export type { DemoCard, DemoPaymentResult };
export { decideDemoPayment };
