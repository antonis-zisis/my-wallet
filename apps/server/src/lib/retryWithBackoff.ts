type RetryOptions = {
  attempts: number;
  delayMs: number;
  onRetry?: () => void;
};

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function retryWithBackoff<Result>(
  operation: () => Promise<Result>,
  options: RetryOptions
): Promise<Result> {
  try {
    return await operation();
  } catch (error) {
    if (options.attempts <= 1) {
      throw error;
    }

    options.onRetry?.();
    await delay(options.delayMs);

    return retryWithBackoff(operation, {
      ...options,
      attempts: options.attempts - 1,
      delayMs: options.delayMs * 2,
    });
  }
}
