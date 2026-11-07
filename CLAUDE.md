@AGENTS.md

# Tylko dla Claude Code

- Hook `PostToolUse` uruchamia `biome check --write` na każdym edytowanym pliku w `frontend/`; błędy nienaprawialne automatycznie wracają do ciebie — popraw je, nie wyłączaj reguł. PHP formatujesz sam: `./vendor/bin/sail php vendor/bin/pint <ścieżka>`.
- Agenci projektowi (`.claude/agents/`, mają pierwszeństwo przed globalnymi): `reviewer` — review zmian taska przed commitem; `test-automator` — wykonanie gotowego specu testu (nigdy w sesji, która pisała kod).
- Na początku odpowiedzi przy zadaniu z kodem napisz „Skille: X, Y” albo „Skille: brak pasującego”. Przy konflikcie wygrywa: ten plik, `AGENTS.md` i `.claude/rules/` → skill główny → uzupełniające.

| Zadanie | Skill główny | Uzupełniające |
| --- | --- | --- |
| PHP, Laravel: kontrolery, serwisy, DTO, modele, migracje | `laravel-clean-code` | `php-clean-code`, `design-patterns` (tylko przy decyzji o strukturze) |
| testy backendu | `testing-laravel` | `test-strategy`, `phpunit` |
| React, TS, komponenty, routing, API klienta | `react-clean-code` | `clean-typescript`, `modern-best-practice-react-components` |
| testy frontendu | `testing-react` | `test-strategy` |
| Tailwind, style | `modern-tailwind` | — |
| semantyka, dostępność, klawiatura | `modern-accessible-html-jsx` | `use-modern-browser-apis` |
| auth, sesja, CSRF, walidacja wejścia | `web-security` | `/security-review` |
| komentarz `/** */` nad eksportem | `tsdoc` (treść po angielsku) | — |
| `AGENTS.md`, `CLAUDE.md`, `.claude/` | `claude-md-guide` | — |
| sprzątanie po tasku | `/simplify` | — |

- `react-clean-code` zawiera rozdziały o TanStack Query i Next.js — tutaj nie obowiązują (brak Query, brak Next). `clean-typescript` zaleca `interface` — tutaj `type`.
