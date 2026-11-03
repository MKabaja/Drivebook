import { z } from 'zod';

const errorSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional()
});
type FieldErrors = Record<string, string[]>;
type ApiOptions = { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; signal?: AbortSignal };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: FieldErrors = {}
  ) {
    super(message);
  }
}

export async function request(
  path: string,
  { method = 'GET', body, signal }: ApiOptions = {}
): Promise<unknown> {
  const headers = new Headers({ Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (method !== 'GET') {
    const cookie = document.cookie.split('; ').find(part => part.startsWith('XSRF-TOKEN='));
    if (cookie) headers.set('X-XSRF-TOKEN', decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)));
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'Nie udało się połączyć. Jeśli wysyłano rezerwację, sprawdź Moje rezerwacje przed ponowną próbą.'
    );
  }
  const text = response.status === 204 ? '' : await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }
  if (!response.ok) {
    const parsed = errorSchema.safeParse(payload);
    const message =
      response.status === 419
        ? 'Sesja wygasła. Odśwież stronę i spróbuj ponownie.'
        : response.status === 401
          ? path === '/api/login'
            ? 'Nieprawidłowy adres e-mail lub hasło.'
            : 'Zaloguj się ponownie, aby kontynuować.'
          : response.status === 429
            ? 'Zbyt wiele prób. Spróbuj ponownie za minutę.'
            : parsed.success
              ? (parsed.data.message ?? 'Operacja nie powiodła się.')
              : 'Serwer zwrócił nieprawidłową odpowiedź. Spróbuj ponownie później.';
    throw new ApiError(response.status, message, parsed.success ? parsed.data.errors : undefined);
  }
  return payload;
}

export async function initializeCsrf(): Promise<void> {
  await request('/sanctum/csrf-cookie');
}

export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError)
    return 'Serwer zwrócił nieprawidłowe dane. Spróbuj ponownie później.';
  return error instanceof Error ? error.message : 'Nie udało się wykonać operacji.';
}
