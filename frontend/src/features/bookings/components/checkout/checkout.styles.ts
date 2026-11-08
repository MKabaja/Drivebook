const checkoutStyles = {
	backLink:
		'mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-copy',
	layout: 'mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]',
	steps: 'grid gap-6 lg:col-start-1 lg:row-start-1',
	step: 'space-y-5',
	stepTitle: 'text-lg font-medium',
	signedIn: 'text-sm leading-6 text-muted',
	unavailable: 'text-sm leading-6 text-error',
	demoNotice: 'rounded-xl border border-accent p-4 text-sm leading-6 text-copy',
	cardFields: 'grid gap-5 sm:grid-cols-2',
	payHint: 'text-center text-xs text-muted',
	summary: 'space-y-4 lg:sticky lg:top-8 lg:col-start-2',
	summaryImage: 'aspect-[1.6] w-full rounded-xl object-cover',
	summaryCategory:
		'text-xs font-semibold uppercase tracking-[0.16em] text-accent',
	summaryName: 'text-xl font-medium',
	rows: 'space-y-3 border-t border-line pt-4 text-sm',
	row: 'flex justify-between gap-4',
	term: 'text-muted',
	total: 'border-t border-line pt-3 text-lg font-semibold',
	note: 'text-xs text-muted',
} satisfies Record<string, string>;

export { checkoutStyles };
