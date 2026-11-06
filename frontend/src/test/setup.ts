import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';

import { server } from '@/test/msw/server';

const unhandledFrames: string[] = [];

beforeAll(() => {
	Object.defineProperty(window, 'scrollTo', {
		value: () => {},
		writable: true,
	});
	server.listen({
		async onUnhandledFrame({ frame, defaults }) {
			unhandledFrames.push(await frame.getUnhandledMessage());
			await defaults.error();
			throw new TypeError('Unhandled request in test');
		},
	});
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	server.resetHandlers();
	const unhandled = unhandledFrames.splice(0);
	expect(unhandled).toEqual([]);
});

afterAll(() => {
	server.close();
});
