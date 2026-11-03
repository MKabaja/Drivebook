export const landingStyles = {
  hero: 'relative isolate grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20',
  texture: 'pointer-events-none absolute -left-12 top-0 -z-10 size-96 opacity-10',
  title: 'max-w-xl text-5xl font-medium leading-[1.07] tracking-[-0.055em] sm:text-6xl lg:text-7xl',
  description: 'mt-6 max-w-md text-base leading-7 text-muted',
  actions: 'mt-8 flex flex-wrap gap-3',
  visual: 'relative overflow-hidden rounded-3xl border border-line bg-panel',
  image: 'aspect-[1.1] w-full object-cover sm:aspect-[1.25]',
  caption:
    'absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 to-black/0 px-6 pb-6 pt-20 text-white',
  steps: 'grid gap-6 border-y border-line py-8 sm:grid-cols-3',
  step: 'flex items-start gap-4',
  stepTitle: 'font-medium text-copy',
  stepDescription: 'mt-2 text-sm leading-6 text-muted',
  callout:
    'my-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line bg-panel p-6 sm:p-9'
} satisfies Record<string, string>;
