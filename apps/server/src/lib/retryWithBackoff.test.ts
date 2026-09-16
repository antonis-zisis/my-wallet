import { describe, expect, it, vi } from 'vitest';

import { retryWithBackoff } from './retryWithBackoff';

const IMMEDIATE = { attempts: 3, delayMs: 0 };

describe('retryWithBackoff', () => {
  it('returns the result without retrying when the operation succeeds', async () => {
    const operation = vi.fn().mockResolvedValue('connected');

    const result = await retryWithBackoff(operation, IMMEDIATE);

    expect(result).toBe('connected');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('returns the result once a later attempt succeeds', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('unreachable'))
      .mockResolvedValue('connected');

    const result = await retryWithBackoff(operation, IMMEDIATE);

    expect(result).toBe('connected');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('gives up after the allowed attempts and rethrows', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('unreachable'));

    await expect(retryWithBackoff(operation, IMMEDIATE)).rejects.toThrow(
      'unreachable'
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('does not retry when only one attempt is allowed', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('unreachable'));

    await expect(
      retryWithBackoff(operation, { attempts: 1, delayMs: 0 })
    ).rejects.toThrow('unreachable');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('reports each retry to the caller', async () => {
    const onRetry = vi.fn();
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('unreachable'))
      .mockResolvedValue('connected');

    await retryWithBackoff(operation, { ...IMMEDIATE, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
