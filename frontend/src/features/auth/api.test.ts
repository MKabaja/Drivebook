import { describe, expect, it } from 'vitest';
import { safeRedirect } from './api';

describe('safeRedirect', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/login',
    '/%2f%2fevil.example'
  ])('rejects an unsafe return path: %s', value => {
    expect(safeRedirect(value)).toBe('/rooms');
  });
  it('preserves the selected room and draft in a local booking path', () => {
    expect(safeRedirect('/bookings/new?roomId=2&startsAt=2030-12-01')).toBe(
      '/bookings/new?roomId=2&startsAt=2030-12-01'
    );
  });
});
