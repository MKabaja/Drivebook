const carDetailsStyles = {
	backLink:
		'inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-copy',
	layout: 'mt-6 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]',
	media: 'overflow-hidden rounded-3xl border border-line bg-panel',
	image: 'aspect-[1.6] w-full object-cover',
	specs: 'mt-4 flex flex-wrap gap-4 text-sm text-muted',
	spec: 'inline-flex items-center gap-2',
	rate: 'mt-6 text-3xl font-semibold tracking-tight',
	unit: 'ml-1 text-base font-normal text-muted',
	booking: 'mt-8 space-y-5',
	bookingTitle: 'text-lg font-medium',
	checkoutAction: 'grid gap-3',
	dateForm: 'grid gap-4',
	dateFields: 'grid gap-4 sm:grid-cols-2',
	hint: 'text-sm leading-6 text-muted',
	quote: 'space-y-3 border-t border-line pt-5 text-sm',
	quoteRow: 'flex justify-between gap-4',
	quoteTerm: 'text-muted',
	quoteTotal: 'border-t border-line pt-3 text-lg font-semibold',
	available: 'mt-4 text-sm text-accent',
	unavailable: 'mt-4 text-sm font-medium text-error',
	alternative: 'grid gap-3 rounded-xl border border-control p-4',
	alternativeTitle: 'flex items-center gap-2 font-medium',
	alternativeText: 'text-sm leading-6 text-muted',
	note: 'text-sm text-muted',
} satisfies Record<string, string>;

export { carDetailsStyles };
