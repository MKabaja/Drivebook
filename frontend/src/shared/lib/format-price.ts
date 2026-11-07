import { CURRENCY, DISPLAY_LOCALE } from '@/shared/config';

const priceFormat = new Intl.NumberFormat(DISPLAY_LOCALE, {
	style: 'currency',
	currency: CURRENCY,
	trailingZeroDisplay: 'stripIfInteger',
});

/**
 * Formatuje kwotę w groszach jako cenę w złotych; pełne złote bez części dziesiętnej („PLN 649”).
 */
function formatPrice(priceInGrosze: number): string {
	return priceFormat.format(priceInGrosze / 100);
}

export { formatPrice };
