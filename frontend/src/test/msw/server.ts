import { setupServer } from 'msw/node';

import { defaultHandlers } from '@/test/msw/handlers';

/**
 * Serwer MSW wspólny dla wszystkich testów — start, reset i zamknięcie w `test/setup.ts`.
 * Żądanie bez handlera wywraca test, więc każdy test deklaruje potrzebne odpowiedzi przez `server.use(...)`.
 */
const server = setupServer(...defaultHandlers);

export { server };
