import { withRetry, RetryOptions } from './retry';

jest.mock('@actions/core', () => ({ debug: jest.fn() }));

function makeFlaky(failTimes: number, error: Error): jest.Mock {
  let calls = 0;
  return jest.fn(async () => {
    if (calls++ < failTimes) throw error;
    return 'success';
  });
}

const fastOptions: RetryOptions = { delayMs: 0, maxAttempts: 3, backoffFactor: 1 };

describe('withRetry', () => {
  it('returns result immediately when fn succeeds on first call', async () => {
    const fn = jest.fn(async () => 42);
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and eventually succeeds', async () => {
    const fn = makeFlaky(2, new Error('rate limit exceeded'));
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws immediately on non-retryable error', async () => {
    const fn = jest.fn(async () => { throw new Error('validation failed'); });
    await expect(withRetry(fn, fastOptions)).rejects.toThrow('validation failed');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all attempts', async () => {
    const fn = makeFlaky(10, new Error('ETIMEDOUT'));
    await expect(withRetry(fn, fastOptions)).rejects.toThrow('ETIMEDOUT');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects custom maxAttempts', async () => {
    const fn = makeFlaky(10, new Error('ECONNRESET'));
    const opts: RetryOptions = { ...fastOptions, maxAttempts: 5 };
    await expect(withRetry(fn, opts)).rejects.toThrow('ECONNRESET');
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('matches 5xx HTTP error patterns', async () => {
    const fn = makeFlaky(1, new Error('Request failed with status 503'));
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
