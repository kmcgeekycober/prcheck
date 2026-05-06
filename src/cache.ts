/**
 * Simple in-process cache for storing changed files per PR
 * to avoid redundant API calls within a single action run.
 */

import { ChangedFile } from './diff';

interface CacheEntry {
  files: ChangedFile[];
  fetchedAt: number;
}

const store = new Map<string, CacheEntry>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function cacheKey(owner: string, repo: string, pullNumber: number): string {
  return `${owner}/${repo}#${pullNumber}`;
}

export function getCached(key: string): ChangedFile[] | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.files;
}

export function setCached(key: string, files: ChangedFile[]): void {
  store.set(key, { files, fetchedAt: Date.now() });
}

export function clearCache(): void {
  store.clear();
}
