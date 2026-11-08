---
paths:
  - "tests/**"
  - "phpunit.xml"
  - "frontend/src/**/*.test.ts"
  - "frontend/src/**/*.test.tsx"
  - "frontend/src/test/**"
  - "frontend/vitest.config.ts"
---

# Testy

Co i ile testować: skill `test-strategy`. Jak pisać: `testing-laravel` (backend), `testing-react` (frontend). Ten plik wygrywa.

## Metodyka

1. Sesja, która napisała kod, nie pisze do niego testów — test dopasowany do implementacji przejdzie razem z błędem.
2. Autor taska przygotowuje **spec**: ścieżka pliku, kontrakt, przypadki z dokładnymi oczekiwanymi wartościami, czego nie testować, komenda uruchomienia, oraz zdanie: „Jeśli wynik różni się od specu, zatrzymaj się i zgłoś — nie zmieniaj ani testu, ani kodu”.
3. Spec wykonuje agent `test-automator`.
4. Sprawdzenie mutacyjne: zepsuj ręcznie warunek (`<` → `<=`, usunięty strażnik), test musi paść; przywróć. Przypadek, którego żadna mutacja nie wywraca, usuń.

## Backend (Pest)

- Feature testy HTTP: kontrakt JSON (`assertJsonPath`, `assertExactJsonStructure` dla nowych zasobów), status, autoryzacja (gość 401, cudzy 403), walidacja tylko dla reguł domeny (nie każdej wbudowanej reguły Laravela).
- Czyste testy jednostkowe dla algorytmów (`AlternativeDatesFinder`, wycena) z datasetami granic.
- Czas zawsze przez `$this->travelTo(...)`; przypadki graniczne dnia w Warszawie testuj też późnym wieczorem UTC.
- Testy domeny dat/rezerwacji uruchamiaj na MySQL (`DB_CONNECTION=mysql`); SQLite inaczej zapisuje daty.
- Test współbieżności: dwa niezależne procesy z własnymi połączeniami, zsynchronizowany start; `#[Group('mysql')]` i `markTestSkipped` poza MySQL. Dwa kolejne requesty nie dowodzą niczego.
- Factory bez stanów, których nikt nie używa.

## Frontend (Vitest + Testing Library)

- Testy w `__tests__/` obok kodu, jeden na główny folder: `lib/__tests__/<function-name>.test.ts`, `components/__tests__/<name>.test.tsx`, `test/factories/__tests__/`. Importy w testach tylko przez `@/`.
- Testujemy logikę: czyste funkcje z `lib/`, przepływy (422/409/401, anulowanie, wybór alternatywy, brak auto-retry POST), atrybuty dostępności, renderowanie warunkowe.
- Nie testujemy: klas Tailwinda, animacji Motion, wnętrza bibliotek, każdego komponentu UI.
- Sieć na granicy przez MSW (`src/test/msw/`): domyślne handlery dla gościa i CSRF, w teście tylko `server.use(...)` dla endpointu, którego dotyczy przypadek; nieobsłużone żądanie = błąd testu. `vi.stubGlobal('fetch')` tylko w testach samego `shared/api/backend.ts`.
- Odpowiedzi z fabryk `src/test/factories/<res>.factory.ts` (`makeX(overrides)`), zgodnych ze schematem Zod (jeden test „factory satisfies schema” na fabrykę); koperty przez `src/test/msw/envelopes.ts`. Ekran z routerem renderuj przez `renderApp(path)`.
- `Date` jest sztuczny w każdym teście (`src/test/setup.ts`); konkretną datę ustawia `vi.setSystemTime`, bez prawdziwego zegara.
- Liczbę żądań sprawdzaj tylko, gdy jest regułą (brak podwójnego POST, sesja bez ponownego `/api/user`) — licznikiem w handlerze, nie przez `mock.calls`.
- Zapytania `screen.getByRole`, `userEvent`, `await findBy…`; bez dostępu przez `container`.
- Fixture'y i nazwy testów po angielsku.
