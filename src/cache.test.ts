import { cacheKey, getCached, setCached, clearCache } from './cache';
import { ChangedFile } from './diff';

const sampleFiles: ChangedFile[] = [
  { filename: 'src/index.ts', status: 'modified', additions: 2, deletions: 1 },
];

beforeEach(() => {
  clearCache();
});

describe('cacheKey', () => {
  it('generates a deterministic key', () => {
    expect(cacheKey('myorg', 'myrepo', 42)).toBe('myorg/myrepo#42');
  });
});

describe('getCached / setCached', () => {
  it('returns null when nothing is cached', () => {
    expect(getCached('myorg/myrepo#1')).toBeNull();
  });

  it('returns cached files after set', () => {
    setCached('myorg/myrepo#1', sampleFiles);
    expect(getCached('myorg/myrepo#1')).toEqual(sampleFiles);
  });

  it('returns null after TTL expires', () => {
    jest.useFakeTimers();
    setCached('myorg/myrepo#1', sampleFiles);
    jest.advanceTimersByTime(6 * 60 * 1000);
    expect(getCached('myorg/myrepo#1')).toBeNull();
    jest.useRealTimers();
  });

  it('clears all entries', () => {
    setCached('myorg/myrepo#1', sampleFiles);
    setCached('myorg/myrepo#2', sampleFiles);
    clearCache();
    expect(getCached('myorg/myrepo#1')).toBeNull();
    expect(getCached('myorg/myrepo#2')).toBeNull();
  });
});
