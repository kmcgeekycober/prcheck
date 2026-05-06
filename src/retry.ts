import * as core from '@actions/core';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  retryableErrors?: RegExp[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 500,
  backoffFactor: 2,
  retryableErrors: [
    /rate limit/i,
    /ETIMEDOUT/,
    /ECONNRESET/,
    /5\d{2}/,
  ],
};

function isRetryable(error: unknown, patterns: RegExp[]): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return patterns.some((pattern) => pattern.test(message));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error, opts.retryableErrors)) {
        throw error;
      }

      if (attempt < opts.maxAttempts) {
        const delay = opts.delayMs * Math.pow(opts.backoffFactor, attempt - 1);
        core.debug(
          `Attempt ${attempt}/${opts.maxAttempts} failed: ${
            error instanceof Error ? error.message : String(error)
          }. Retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
