type DemoPaymentOutcome = 'approved' | 'declined';
type DemoCardNumberByOutcome = Record<DemoPaymentOutcome, string>;

const demoCardNumberByOutcome: DemoCardNumberByOutcome = {
	approved: '4242 4242 4242 4242',
	declined: '4000 0000 0000 0002',
};
const DEMO_PAYMENT_DELAY_MS = 400;

export type { DemoPaymentOutcome };
export { DEMO_PAYMENT_DELAY_MS, demoCardNumberByOutcome };
