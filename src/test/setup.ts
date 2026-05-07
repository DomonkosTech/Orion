import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';

// Mock react-i18next globally
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'hu',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Fix ReferenceError: Event is not defined
if (typeof window !== 'undefined') {
    // @ts-expect-error jsdom global type mismatch with DOM Event types
    global.Event = window.Event;
    // @ts-expect-error jsdom global type mismatch with DOM Event types
    global.MouseEvent = window.MouseEvent;
    // @ts-expect-error jsdom global type mismatch with DOM Event types
    global.KeyboardEvent = window.KeyboardEvent;
}

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => server.close());
