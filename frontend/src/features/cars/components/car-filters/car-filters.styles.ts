const carFiltersStyles = {
	form: 'mt-8',
	heading: 'mb-5 flex items-center gap-2 text-base font-medium',
	grid: 'grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr_1fr_auto] xl:[&>button]:mt-7',
	footer:
		'mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted',
	clearLink:
		'min-h-11 content-center text-accent underline underline-offset-4 hover:text-copy',
} satisfies Record<string, string>;

export { carFiltersStyles };
