---
paths:
  - "app/**/*.php"
  - "bootstrap/**/*.php"
  - "config/**/*.php"
  - "database/**/*.php"
  - "routes/**/*.php"
---

# Backend — Laravel

Pełny standard: skille `laravel-clean-code` i `php-clean-code`. Ten plik wygrywa. Styl istniejącego kodu jest wzorcem — nowe klasy piszesz tak samo.

- `declare(strict_types=1)` w każdym pliku, jawne typy parametrów i zwracane. `final` dla DTO, serwisów, walidatorów i wyjątków; kontrolery, modele i requesty jak dotychczas. Zależności przez promowany konstruktor `private readonly`. PHPDoc tylko dla generyków Larastana (`@return LengthAwarePaginator<int, Car>`, relacje, `@property` modeli) — nic, co wyraża typ natywny.
- DTO: `final readonly class` z konstruktorem promowanym i `static fromRequest(FormRequest $request): self` czytającym `validated()`. Serwis przyjmuje DTO lub typowane argumenty, nigdy `Request`.
- Enumy backed (`string`) dla statusów i skrzyni; w migracjach literały stringów, nie enumy aplikacji (migracja nie może zależeć od kodu, który się zmieni).
- Kontroler: `authorize` przez policy, jedna metoda serwisu, zwrot `JsonResource`/`ResourceCollection` z jawnym statusem. Bez logiki domeny i zapytań w kontrolerze.
- Resource: jawne pola, relacje przez `whenLoaded()`, bez zapytań wewnątrz. Nie ujawniaj `user_id` ani cudzych rezerwacji.
- Eloquent: zapytania w serwisie lub scope'ach modelu; jedno źródło predykatu nakładania (`scopeOverlapping`) — nie powielaj go w PHP. Eager loading przy listach. Paginacja przez `paginate()` i `->through()`, nie ręczne składanie paginatora.
- Transakcja: `DB::transaction` w serwisie; blokada `Car::lockForUpdate()` przed sprawdzeniem konfliktów; żadnych zewnętrznych wywołań w transakcji.
- Błędy domenowe jako własne wyjątki (`app/Exceptions/`) renderowane w `bootstrap/app.php` → `withExceptions`; walidacyjne konflikty jako `ValidationException` (422).
- Stałe domeny (`Europe/Warsaw`, 10:00, okno alternatyw, maks. długość wynajmu, rozmiary stron) w `config/rental.php`, czytane przez `config()`; daty przez `CarbonImmutable` w strefie z configu.
- Migracje: schemat DriveBook od zera (cars, bookings) — bez tabel i kolumn po salach. Nowa zmiana schematu = nowa migracja, gdy migracje trafią do `main`.
- Seedery: dane demo aut z lokalnymi zdjęciami; bez duplikatów, bez danych osobowych.
- Bez nowych pakietów (Rector, PHPat, Boost, spatie/*) bez zgody.
