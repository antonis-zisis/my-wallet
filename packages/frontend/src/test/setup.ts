import '@testing-library/jest-dom';

// Suppress expected unhandled rejections from Apollo MockLink errors
// This is a known behavior when testing GraphQL error scenarios
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
