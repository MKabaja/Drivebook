import { setupServer } from 'msw/node';

import { defaultHandlers } from '@/test/msw/handlers';

/**
 * MSW server shared by all tests; started, reset and closed in `test/setup.ts`.
 * A request without a handler fails the test, so each test declares the responses it needs with `server.use(...)`.
 */
const server = setupServer(...defaultHandlers);

export { server };
