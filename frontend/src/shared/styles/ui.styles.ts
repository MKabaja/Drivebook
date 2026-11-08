const uiStyles = {
	shell: 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12',
	page: 'py-10 sm:py-16',
	eyebrow: 'mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent',
	title: 'text-3xl font-medium tracking-tight sm:text-4xl',
	lead: 'mt-4 max-w-2xl text-base leading-7 text-muted',
	panel: 'rounded-2xl border border-line bg-panel p-5 sm:p-7',
	primary:
		'inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-accent px-6 text-sm font-semibold text-canvas transition-colors hover:bg-copy disabled:cursor-wait disabled:opacity-60 aria-disabled:cursor-wait aria-disabled:opacity-60',
	secondary:
		'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-control px-5 text-sm font-medium text-copy transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60 aria-disabled:cursor-wait aria-disabled:opacity-60',
	input:
		'mt-2 min-h-12 w-full rounded-xl border border-control bg-canvas px-4 py-3 text-copy aria-invalid:border-error',
	fieldLabel: 'block text-sm font-medium text-copy',
	fieldError: 'mt-2 text-sm text-error',
	alert:
		'rounded-xl border border-error bg-panel p-4 text-sm leading-6 text-copy',
	grid: 'mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3',
	empty:
		'mt-8 rounded-2xl border border-line bg-panel p-10 text-center text-muted',
	form: 'space-y-5',
} satisfies Record<string, string>;

export { uiStyles };
