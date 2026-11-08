# DriveBook

Portfolio junior fullstack: rezerwacja aut jednej wypożyczalni.
Stack: Laravel 13 + PHP ^8.5, Sanctum 4 (sesyjne SPA), MySQL 8.4, Pest 4, Larastan (poziom 6), Pint. Frontend w `frontend/`: React 19 + TypeScript 6 strict, Vite 8, Tailwind 4, TanStack Router (file-based), Zod 4, Biome 2, Vitest + Testing Library, Lucide, Motion.
Celowo bez: Prettier i ESLint (formatuje i lintuje tylko Biome), TanStack Query, axios, Redux/Zustand, React Hook Form, shadcn, cn/clsx/cva, bibliotek dat. Dodanie którejkolwiek wymaga zgody.

<!-- Utrzymanie: < 200 linii, każda linia ma zapobiegać realnemu błędowi. Szczegóły części kodu → .claude/rules/ (paths:).
     docs/ jest gitignorowany — nic potrzebnego w każdej sesji nie może żyć wyłącznie w docs/. -->

## Komendy

Backend przez Sail (`./vendor/bin/sail up -d`): testy, analiza i lint tylko w kontenerze (MySQL i `.env` Saila). Lokalne PHP, jeśli jest, służy wyłącznie narzędziom IDE.

- `./vendor/bin/sail composer lint` — Pint, **zapisuje pliki**; kontrola bez zapisu: `./vendor/bin/sail php vendor/bin/pint --test`
- `./vendor/bin/sail composer analyse` — Larastan
- `./vendor/bin/sail composer test -- tests/Feature/Booking/StoreBookingTest.php` — jeden plik; bez ścieżki cały zestaw
- `./vendor/bin/sail composer check` — lint + analyse + test

Frontend (Node 24 z `frontend/.nvmrc`):

- `npm --prefix frontend run dev` — Vite na 5174, proxy `/api`, `/sanctum` i `/storage` do Laravela
- Po świeżej bazie: `./vendor/bin/sail artisan storage:link` i `./vendor/bin/sail artisan db:seed` — zdjęcia aut serwuje dysk `public`
- `npm --prefix frontend run lint:fix` — Biome: lint + format + importy (**zapisuje**); `lint` bez zapisu; `format` — tylko formatowanie (**zapisuje**)
- `npm --prefix frontend run typecheck` — `tsc` dla `tsconfig.app.json` i `tsconfig.node.json`
- `npm --prefix frontend test` — Vitest jednorazowo; jeden plik: `npm --prefix frontend test -- src/<ścieżka>.test.tsx`
- `npm --prefix frontend run build` — typecheck + `vite build`

## Gotowe =

- Backend: Pint `--test`, `analyse` i testy dotkniętych obszarów na **MySQL** przechodzą.
- Frontend: `lint`, `typecheck`, `test` i `build` przechodzą; zmieniona interakcja sprawdzona w przeglądarce, gdy środowisko działa.
- Podajesz rzeczywiste wyniki uruchomionych komend. Czego nie uruchomiono — mówisz wprost, nie deklarujesz.

## Współpraca

- Odpowiadaj po polsku, krótko i konkretnie. Wyjaśniaj decyzje tak, aby autor potrafił obronić kod na rozmowie rekrutacyjnej.
- Kod pisze agent, autor robi review. Jeden task na raz → weryfikacja → pokazanie diffu i komunikatu commita → stop. Nowe funkcje: najpierw zapytaj, kto pisze.
- Realizuj zlecony zakres. Bez refaktorów poza taskiem, abstrakcji na zapas, kopiowania architektury Next.js z Linkera.
- Na starcie sesji: pamięć projektu (Claude ładuje sama; inni agenci: `.ai/memory/MEMORY.md`). Postęp i decyzje zapisuj w pamięci, bez sekretów.

## Architektura — backend

- Osobne JSON REST API i SPA. Bez Blade, Inertii, Next.js.
- Przepływ: FormRequest (walidacja) → cienki Controller (HTTP + `authorize`) → DTO `readonly` (`fromRequest`) → Service (operacja biznesowa, transakcja) → Eloquent → JsonResource.
- Bez Repository opakowującego Eloquent, bazowych CRUD-serwisów i interfejsów z jedną implementacją. Interfejs walidatorów rezerwacji zostaje (wiele implementacji).
- Serwis nie dostaje `Request` i nie rzuca wyjątków HTTP — wyjątek domenowy mapowany na status w `bootstrap/app.php`.
- Rezerwacje: `BookingService` + pipeline walidatorów. Zapis i anulowanie: blokada wiersza `Car` → sprawdzenie konfliktów → zapis, w jednej transakcji, zawsze w tej kolejności. Samo `lockForUpdate()` nie jest dowodem — współbieżność testuje osobny test na MySQL.
- Uprawnienia na backendzie przez policy/middleware. Nie zmieniaj kontraktu API ani autoryzacji przy okazji zmian UI.
- Szczegóły PHP/Laravel: `.claude/rules/backend.md`.

## Architektura — frontend

- Feature-first: `frontend/src/features/<feature>/{api,model,lib,components}`; `shared/` tylko dla kodu użytego przez 2+ feature'y i bez wiedzy o nich; `routes/` to cienkie pliki tras; `app/` składa całość.
- Dane stron przez loadery TanStack Routera (`loaderDeps`, `AbortSignal`), filtry i paginacja w URL (`validateSearch` + Zod). Po mutacji `router.invalidate()`. Nie pisz własnego cache ani `useQuery`.
- Transport tylko przez `shared/api/backend.ts` (fetch, cookies, XSRF, `HttpError`/`NetworkError`); każda odpowiedź parsowana Zodem w `*.api.ts`. Brak `as T` na danych sieciowych.
- Szczegóły: `.claude/rules/frontend.md`; style: `.claude/rules/styling.md`.

## Domena (reguły, które łatwo zepsuć)

- Daty `starts_on`/`ends_on` (`YYYY-MM-DD`) jako przedział półotwarty `[start, end)`; konflikt: `istniejący.start < nowy.end AND istniejący.end > nowy.start`, tylko `confirmed`.
- Strefa `Europe/Warsaw`, odbiór/zwrot 10:00, odbiór najwcześniej jutro (wg Warszawy, nie UTC). Doby = różnica dat kalendarzowych.
- Ceny w groszach (`int`), snapshot stawki i sumy w `bookings`. Klient wysyła `expected_daily_rate_in_grosze`; różnica → 409. POST rezerwacji nigdy nie jest ponawiany automatycznie.
- Statusy tylko `confirmed` i `cancelled`. Anulowanie przez właściciela do 10:00 w dniu odbioru.
- Stałe domeny (strefa, godzina, limity, rozmiary stron) w jednym miejscu — nie powielaj literałów.

## Testy

- Zachowanie i granice, nie implementacja. Backend: Pest feature testy + czyste testy jednostkowe algorytmów; testy zależne od dat/transakcji/blokad tylko na MySQL. Frontend: Vitest + Testing Library, `fetch` stubowany na granicy.
- Sesja, która napisała kod, nie pisze do niego testów — spec testu → agent `test-automator` → sprawdzenie mutacyjne. Szczegóły: `.claude/rules/tests.md`.

## Granice

- Zawsze: weryfikacja z sekcji „Gotowe”; czas w testach przez `travelTo`/fake timers.
- Najpierw zapytaj: nowe zależności, zmiany schematu bazy lub kontraktu API spoza taska, zmiany `biome.json`/`phpstan.neon`/`pint.json`, usuwanie plików spoza taska.
- Nigdy: usuwanie danych, wolumenów, `migrate:fresh` na bazach innych niż testowa bez wyraźnej zgody; wyłączanie reguł lintu/PHPStan/testów lub baseline dla ukrycia błędu; sekrety w repo, instrukcjach i pamięci; ręczna edycja lockfile i `frontend/src/routeTree.gen.ts`; zmiany w repo `linker` i `shiftflow-frontend` (tylko referencja).

## Git

- Commit dopiero po pokazaniu komunikatu i listy plików oraz wyraźnej akceptacji. Branch tylko na polecenie. Nigdy push ani PR bez prośby (wyjątek: automatyczna synchronizacja pamięci w `claude-config`). `git add -A` tylko na prośbę.
- Conventional Commits: `typ(zakres): opis`, np. `feat(cars): search available cars`. Commity małe, jeden typ zmiany na commit; plik z dwoma tematami rozdzielasz tak, by każdy commit osobno się budował.
- Komunikat to wyłącznie linia `typ(zakres): opis` i ewentualnie treść o zmianie. Nic więcej — dotyczy też nazw branchy, tytułów i treści PR:
  - bez podpisów i trailerów: `Co-Authored-By`, `Signed-off-by`, „Generated with…”;
  - bez nazwy, ID ani linku sesji (np. `Session: …`, `session_…`, `claude.ai/code/…`, nazwa wątku/rozmowy);
  - bez wzmianek o agentach, modelach, Codexie, Claude, skillach i `AGENTS.md`/`CLAUDE.md`.
- Nie używaj `git stash`, `reset --hard`, `checkout -- <plik>` ani `clean` na niezacommitowanych zmianach bez zgody.

## Wspólne zasoby agentów

- Skille, agenci i komendy: repo `claude-config` (Claude — globalnie przez `~/.claude`; inni agenci — `.ai/shared/skills/<nazwa>/SKILL.md`, `.agents/skills`). Podłączenie na nowym komputerze: `bash scripts/connect-agents.sh [ścieżka/do/claude-config]`.
- Reguły ścieżkowe `.claude/rules/*.md` obowiązują wszystkich agentów — inni niż Claude czytają je ręcznie przed pracą w danym obszarze.
- Nie edytuj zasobów `claude-config` w ramach zadań DriveBooka; wolno tylko pamięć `memory/drivebook/`.
