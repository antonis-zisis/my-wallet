import '@testing-library/jest-dom';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Suppress expected unhandled rejections from Apollo MockLink errors
// This is a known behavior when testing GraphQL error scenarios
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (reason: unknown) => {
    // Suppress Apollo MockLink errors that are expected in error tests
    if (
      reason instanceof Error &&
      reason.message === 'Failed to create transaction'
    ) {
      return;
    }
    // Re-throw unexpected errors
    throw reason;
  });
}
