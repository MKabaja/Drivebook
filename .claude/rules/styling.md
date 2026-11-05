---
paths:
  - "frontend/src/**/*.styles.ts"
  - "frontend/src/**/*.tsx"
  - "frontend/src/styles/**"
---

# Style (Tailwind 4)

Ogólne zasady: skill `modern-tailwind`. Ten plik wygrywa.

- Tokeny w `styles/theme.css` (`@theme`): semantyczne kolory, font, promienie, cienie. Bez surowych hexów i kolorów palety w komponentach.
- `styles/global.css` — `@layer base` (elementy, `:focus-visible`, `::selection`); `styles/app.css` — punkt wejścia. `helpers.css`/`animations.css` dopiero, gdy powstanie realnie powtarzane `@utility`/animacja.
- Klasy w `<name>.styles.ts` obok komponentu: `const carCardStyles = { … } satisfies Record<string, string>`; warianty jako `Record<Variant, string>` z nazwanym typem. W TSX destrukturyzuj (`const { card, title } = carCardStyles`); przy kolizji nazw zmień klucz, nie aliasuj.
- W TSX dopuszczalne pojedyncze krótkie klasy układu; dłuższe listy → `*.styles.ts`.
- Pełne literalne klasy, bez składania `bg-${color}`. Łączenie: template string lub tablica `.join(' ')`; bez cn/clsx.
- Ciemny motyw grafit + limonka, jeden motyw bez przełącznika. Kontrast tekstu ≥ 4.5:1, kontrolek ≥ 3:1.
- Animacje Motion tylko z `useReducedMotion`/`MotionConfig reducedMotion="user"`; bez zapętlonych animacji. Na elementach animowanych przez Motion bez klas `transform`.
- Zdjęcia lokalne w `public/images/cars/`, źródło i licencja każdego w `SOURCES.md`.
