const inlineAuthStyles = {
	switcher: 'mb-5 grid grid-cols-2 gap-1 rounded-full border border-line p-1',
	option:
		'min-h-10 rounded-full text-sm font-medium text-muted transition-colors hover:text-copy',
	activeOption:
		'min-h-10 rounded-full bg-accent text-sm font-semibold text-canvas',
} satisfies Record<string, string>;

export { inlineAuthStyles };
