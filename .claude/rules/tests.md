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

- Testujemy logikę: czyste funkcje z `lib/`, przepływy (422/409/401, anulowanie, wybór alternatywy, brak auto-retry POST), atrybuty dostępności, renderowanie warunkowe.
- Nie testujemy: klas Tailwinda, animacji Motion, wnętrza bibliotek, każdego komponentu UI.
- `fetch` stubowany na granicy (`vi.stubGlobal`), odpowiedzi budowane fabrykami z `test/factories/`, zgodnymi ze schematem Zod (jeden test „factory satisfies schema” na fabrykę).
- Zapytania `screen.getByRole`, `userEvent`, `await findBy…`; bez dostępu przez `container`.
- Fixture'y i nazwy testów po angielsku.
