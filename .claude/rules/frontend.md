---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# Frontend — architektura i standard kodu

Pełny standard z przykładami: skill `react-clean-code` (bez rozdziałów o TanStack Query i Next.js). Ten plik wygrywa ze skillem.

## Warstwy i kierunek zależności

```
src/
├── main.tsx                     montowanie RouterProvider; nic więcej
├── app/                         router.ts (createRouter + routeTree.gen + context), layouts/; widzi wszystko
├── routes/                      cienkie trasy: path, validateSearch (schemat z model/), beforeLoad, loader → *.api.ts, component
├── features/<feature>/
│   ├── api/<res>.api.ts         czyste funkcje HTTP: backend.* + parse Zod + odpakowanie { data }; bez Reacta
│   ├── model/<res>.schemas.ts   schematy Zod + `type X = z.infer<…>`; <res>.constants.ts — etykiety, limity
│   ├── lib/<function-name>.ts   czyste funkcje (daty, ceny, mapowanie błędów); plik = nazwa funkcji
│   ├── components/<name>/       <name>.tsx, <name>.styles.ts, <name>.test.tsx, części <name>.<part>.tsx
│   └── pages/<name>-page.tsx    tylko gdy ekran składa kilka komponentów
├── shared/
│   ├── api/                     backend.ts, http-error.ts, network-error.ts, envelopes.ts (resourceOf, pageOf)
│   ├── components/<name>/       ogólne UI bez wiedzy o domenie
│   ├── lib/                     czyste funkcje ogólne (format-price, warsaw-date)
│   └── config.ts                wszystkie stałe i limity
├── styles/                      app.css, theme.css, global.css
└── test/                        setup.ts, factories/<res>.factory.ts
```

- `shared/**` nie importuje `features/`, `routes/`, `app/`. `features/**` nie importuje `routes/` ani `app/`.
- Między feature'ami wolno importować tylko `model/` i `api/` innego feature'a; wspólne rzeczy (paginacja, formatowanie) przenieś do `shared/`.
- `components/` nie woła `backend` — dane dostaje z loadera (`Route.useLoaderData()`) lub propsów; mutacje przez funkcje z `api/`.
- Granice egzekwuje Biome (`noRestrictedImports` w `overrides`). Nie dodawaj wyjątków bez zgody.

## Transport i dane

- `backend.get/post/patch/delete` zwraca `Promise<unknown>` — TS wymusza parse schematem w `*.api.ts`. Nikt powyżej `api/` nie widzi `{ data }`.
- `backend` rzuca `HttpError(status, body)` lub `NetworkError`; aborty przepuszcza. Nie zawiera tekstów domenowych ani wyjątków dla konkretnych ścieżek.
- Mapowanie błędu na komunikat UI w `lib/` feature'a: 422 → błędy pól z `errors`, 409 → zmiana ceny, 401/419 → logowanie, reszta → ogólny komunikat.
- Zod: `z.object` (nieznane pola usuwane), daty jako `z.string()` w formacie `YYYY-MM-DD`, walidujemy tylko pola, których używa UI. Ciała żądań nie są walidowane Zodem (formularz waliduje wejście, backend jest autorytetem).
- Pola API zostają w snake_case — bez mappera na camelCase (klucze 422 muszą pasować do nazw pól formularza).
- Schematy pisz z faktycznej odpowiedzi API (curl / test feature), nie z README.

## Nazwy

- Pliki i foldery kebab-case z sufiksem roli: `cars.api.ts`, `car.schemas.ts`, `car-card.styles.ts`, `format-price.ts`. Eksport nazwany jak zawartość (`car-card.tsx` → `CarCard`).
- Funkcje = czasowniki (`fetchCars`, `createBooking`, `cancelBooking`); boolean `is/has/can/should`; jednostka w nazwie (`totalPriceInGrosze`); mapy jak zdanie (`labelByTransmission`, `type LabelByTransmission`). Bez `data`, `item`, `helper`, `utils`.

## Kod

- Deklaracje `function` (także komponenty i helpery). Stepdown: eksportowane API na górze, prywatne helpery pod spodem.
- Eksporty nazwane w jednym `export { … }` na końcu pliku; `export default` tylko w configach narzędzi. Bez barreli `index.ts`.
- Importy przez alias `@/`; typy przez `import type`.
- `type`, nie `interface`. Bez `any`, nieuzasadnionych `as`, `!`, `@ts-ignore`. Złożone typy jako nazwane aliasy.
- Stan powiązanych flag jako discriminated union (`{ status: 'idle' } | { status: 'submitting' } | { status: 'error'; message }`), zamiast `switch` — `Record<Stan, Handler>`. Bez zagnieżdżonych ternary.
- 0–2 argumenty (max 3, potem obiekt), bez argumentów flagowych, guard clauses. Czas przekazywany jako argument (`today: string`), nie `new Date()` w logice.
- React: nazwane importy z `react`; nie trzymaj w stanie tego, co da się obliczyć; `useEffect` tylko do synchronizacji z systemem zewnętrznym; bez automatycznego `useMemo`/`useCallback`/`memo` (brak React Compilera — memoizacja tylko po wykazaniu potrzeby). Formularze: natywne `<form>` + `FormData` + ograniczenia HTML.
- Hook tylko, gdy potrzebuje stanu, efektu lub kontekstu; inaczej funkcja w `lib/`. Hook ma nazwany typ zwracany.
- Komponent > ~150 linii lub z kilkoma odpowiedzialnościami → podziel na części w `components/`.
- Bez komentarzy w kodzie. TSDoc tylko na eksportowanym, reużywalnym API (skill `tsdoc`, po polsku), o tym, czego nie widać w sygnaturze.
- Teksty UI po polsku, w komponentach lub `*.constants.ts` — bez i18n.
- Każdy ekran obsługuje loading (`pendingComponent`), error (`errorComponent`), empty i 404 (`notFound()`).
- Dostępność: semantyczny HTML, `<label>` dla pól, focus po nawigacji/akcji nie ląduje na `<body>`, komunikaty statusu przez `role="status"`/`aria-live`. Jeden link na kartę (cała karta klikalna przez pseudo-element).
- Nie remontuj stron kluczem `key={JSON.stringify(search)}` — stan formularza wyprowadzaj z URL.
