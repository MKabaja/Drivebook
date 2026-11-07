const carCardStyles = {
	card: 'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-control has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent',
	media: 'relative aspect-[1.6] overflow-hidden',
	image:
		'size-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105',
	badge:
		'absolute left-4 top-4 rounded-full bg-canvas px-3 py-1.5 text-xs font-medium text-copy',
	body: 'flex flex-1 flex-col p-5 sm:p-6',
	title: 'text-xl font-semibold tracking-tight',
	titleLink:
		'outline-none after:absolute after:inset-0 after:content-[""] focus-visible:outline-none',
	specs: 'mb-6 mt-3 flex flex-wrap gap-4 text-sm text-muted',
	spec: 'inline-flex items-center gap-2',
	footer:
		'mt-auto flex items-end justify-between gap-4 border-t border-line pt-5',
	price: 'text-2xl font-semibold tracking-tight',
	unit: 'ml-1 text-sm font-normal text-muted',
	total: 'mt-1 text-sm text-muted',
	cta: 'flex min-h-11 items-center gap-2 rounded-full border border-control px-4 text-sm font-medium text-copy transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-canvas',
} satisfies Record<string, string>;

export { carCardStyles };
