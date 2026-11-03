export const carCardStyles = {
  card: 'group overflow-hidden rounded-2xl border border-line bg-panel',
  imageLink: 'relative block overflow-hidden aspect-[1.6]',
  image:
    'h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105',
  category:
    'absolute top-4 left-4 rounded-full bg-canvas px-3 py-1.5 text-xs font-medium text-copy',
  body: 'p-5 sm:p-6',
  title: 'text-xl font-semibold tracking-tight',
  specs: 'mt-3 flex flex-wrap gap-4 text-sm text-muted',
  spec: 'inline-flex items-center gap-2',
  bottom: 'mt-6 flex items-end justify-between gap-4 border-t border-line pt-5',
  price: 'text-2xl font-semibold tracking-tight',
  unit: 'ml-1 text-sm font-normal text-muted',
  button:
    'flex min-h-11 items-center gap-2 rounded-full border border-control px-4 text-sm font-medium text-copy transition-colors hover:border-accent hover:bg-accent hover:text-canvas'
} satisfies Record<string, string>;
