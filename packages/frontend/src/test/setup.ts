import '@testing-library/jest-dom';

// mock matchMedia for tests
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

// suppress expected unhandled rejections from Apollo MockLink errors
// this is a known behavior when testing GraphQL error scenarios
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (reason: unknown) => {
    // suppress Apollo MockLink errors that are expected in error tests
    if (
      reason instanceof Error &&
      reason.message === 'Failed to create transaction'
    ) {
      return;
    }

    // re-throw unexpected errors
    throw reason;
  });
}
