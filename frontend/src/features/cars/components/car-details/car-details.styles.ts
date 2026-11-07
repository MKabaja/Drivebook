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
	summary: 'mt-8 space-y-2 text-sm text-muted',
	summaryTitle: 'text-base font-medium text-copy',
	unavailable: 'font-medium text-error',
	note: 'pt-2',
} satisfies Record<string, string>;

export { carDetailsStyles };
