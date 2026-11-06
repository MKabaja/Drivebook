export const layoutStyles = {
	skip: 'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:p-4 focus:text-canvas',
	header: 'border-b border-line',
	headerInner:
		'flex min-h-24 flex-wrap items-center justify-between gap-4 py-4',
	logo: 'inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-copy',
	logoIcon:
		'flex size-9 items-center justify-center rounded-xl bg-accent text-canvas',
	nav: 'flex flex-wrap items-center gap-4 text-sm sm:gap-6',
	navLink:
		'min-h-11 content-center text-muted transition-colors hover:text-copy [&.active]:text-accent',
	footer: 'mt-auto border-t border-line py-7 text-xs text-muted',
	footerInner: 'flex flex-wrap items-center justify-between gap-4',
} satisfies Record<string, string>;
