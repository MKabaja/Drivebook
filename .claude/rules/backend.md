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

- `declare(strict_types=1)` w każdym pliku, jawne typy parametrów i zwracane. `final` dla DTO, serwisów, walidatorów i wyjątków; kontrolery, modele i requesty jak dotychczas. Zależności przez promowany konstruktor `private readonly`. PHPDoc według sekcji „PHPDoc” niżej.
- DTO: `final readonly class` z konstruktorem promowanym i `static fromRequest(FormRequest $request): self` czytającym `validated()`. Serwis przyjmuje DTO lub typowane argumenty, nigdy `Request`.
- Enumy backed (`string`) dla statusów i skrzyni; w migracjach literały stringów, nie enumy aplikacji (migracja nie może zależeć od kodu, który się zmieni).
- Kontroler: `authorize` przez policy, jedna metoda serwisu, zwrot `JsonResource`/`ResourceCollection` z jawnym statusem. Bez logiki domeny i zapytań w kontrolerze.
- Resource: jawne pola, relacje przez `whenLoaded()`, bez zapytań wewnątrz. Nie ujawniaj `user_id` ani cudzych rezerwacji.
- Eloquent: zapytania w serwisie lub scope'ach modelu; jedno źródło predykatu nakładania (`scopeOverlapping`) — nie powielaj go w PHP (wyjątek: czysta funkcja `AlternativeDatesFinder`, testowana jednostkowo). Eager loading przy listach. Paginacja przez `paginate()` i `->through()`, nie ręczne składanie paginatora.
- Transakcja: `DB::transaction` w serwisie; blokada `Car::lockForUpdate()` przed sprawdzeniem konfliktów; żadnych zewnętrznych wywołań w transakcji.
- Błędy domenowe jako własne wyjątki (`app/Exceptions/`) renderowane w `bootstrap/app.php` → `withExceptions`; walidacyjne konflikty jako `ValidationException` (422).
- Stałe domeny (`Europe/Warsaw`, 10:00, okno alternatyw, maks. długość wynajmu, rozmiary stron) w `config/rental.php`, czytane przez `config()`; daty przez `CarbonImmutable` w strefie z configu.
- Migracje: zmiana schematu = nowa migracja, bez edycji istniejących.
- Seedery: dane demo aut z lokalnymi zdjęciami; bez duplikatów, bez danych osobowych.
- Bez nowych pakietów (Rector, PHPat, Boost, spatie/*) bez zgody.

## Czytelność (wzorzec: `CarController`, `CarService`, `AlternativeDatesFinder`)

- Kontroler: jeden krok na linię — DTO → wynik serwisu w nazwanej zmiennej → `return` Resource. Bez zagnieżdżania wywołań w `return`.
- Łańcuch 3+ wywołań albo linia > 120 znaków → każde `->` w osobnej linii pod spodem (wzorzec: `CarService::bookedDatesWithin`). Pint tego nie wymusza — pilnuje review.
- Bez closure z logiką w łańcuchach zapytań: warunek zapytania to scope modelu (`Car::scopeAvailableDuring`), opcjonalne filtry to jawne `if` w prywatnej metodzie (`carsMatching()`), a nie `->when(..., fn (Builder) => ...)`. Closure tylko jako wywołanie nazwanej metody albo łańcuch scope'ów w `whereHas`/`whereDoesntHave`.
- Warunek złożony lub nieoczywisty → nazwana zmienna `bool` albo metoda (`$candidateFitsBeforeBooking`, `isBooked()`). Krok algorytmu z własną regułą → prywatna metoda z nazwą mówiącą, co robi.
- Dane między warstwami (HTTP → serwis → Resource) i między metodami to DTO albo `list<Dto>`/kształt tablicy w PHPDoc (`@param list<RentalDates>`, `@return array{...}`), tak by hover w IDE pokazywał zawartość. Gołe `array` bez typu elementów nie przekracza granicy metody.
- Pole nullable tylko, gdy `null` coś znaczy. Pola, które istnieją razem albo wcale, grupuj w osobnym DTO (`CarViewData::$rentalAvailability`), żeby nie dało się zbudować niepoprawnej kombinacji nulli.
- Nazwy parametrów i zmiennych z jednostką lub rolą (`$latestPickupDate`, `$requestedDates`), nie `$latestStart`, `$candidate`, `$data`. Argumenty nazwane przy 3+ parametrach tego samego typu.
- Nazwy prostymi słowami zamiast żargonu branżowego: `RentalPrice` (nie `quote`), `RentalDates` (nie `period`).

## PHPDoc — typy najpierw, opis tylko z wartością

- Czysty kod nie potrzebuje komentarzy objaśniających działanie. PHPDoc służy do typów, których nie wyrazi PHP: `list<RentalDates>`, `array{starts_on: string, ...}`, `Builder<Car>`, `LengthAwarePaginator<int, CarViewData>` (Larastan sprawdza generyki i kształty tablic, IDE pokazuje je w tooltipie). Zakresów `int<…>`/`positive-int` używaj tylko, gdy kod je gwarantuje — Larastan na poziomie 6 ich nie wymusza.
- Opis (po angielsku, krótko) tylko dla tego, czego nie widać w nazwie i typie: znaczenie `null`, jednostka/strefa, granice przedziału, `@throws Klasa` z warunkiem.
- DTO: jedno zdanie nad klasą o tym, co nieoczywiste w polach (`RentalDates`: przedział półotwarty, północ w `rental.timezone`); bez komentarza nad każdym polem. Na polu tylko doprecyzowany typ (`/** @var positive-int */`).
- Bez `@property-read` dublujących prawdziwe pola DTO — Larastan ich nie sprawdza, rozjadą się z kodem. `@property` modeli Eloquent zostaje (kolumny są magiczne).
- Bez podsumowań typu „Returns the car…”, gdy nazwa metody to mówi; bez PHPDoc w kontrolerach, FormRequestach i Resources (poza kształtem tablic).
