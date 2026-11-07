import { CURRENCY, DISPLAY_LOCALE } from '@/shared/config';

const priceFormat = new Intl.NumberFormat(DISPLAY_LOCALE, {
	style: 'currency',
	currency: CURRENCY,
	trailingZeroDisplay: 'stripIfInteger',
});

/**
 * Formats an amount in grosze as a złoty price; whole złoty without decimals (`PLN 649`).
 */
function formatPrice(priceInGrosze: number): string {
	return priceFormat.format(priceInGrosze / 100);
}

export { formatPrice };
